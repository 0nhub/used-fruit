import SwiftUI
import PhotosUI

struct InboxView: View {
    @Environment(AppStore.self) private var store
    @State private var archived=false
    private var chats:[Conversation]{store.data.chats.filter{$0.archived==archived}}
    var body: some View {
        NavigationStack {
            VStack(spacing:0) {
                Picker("Bereich",selection:$archived){Text("Nachrichten").tag(false);Text("Archiv").tag(true)}.pickerStyle(.segmented).padding(.horizontal).padding(.bottom,12)
                if chats.isEmpty { ContentUnavailableView("Hier beginnt der Austausch", systemImage: "bubble.left.and.bubble.right", description: Text("Öffne ein Inserat und tippe auf „Nachricht“.")) }
                else { List(chats.sorted { ($0.messages.last?.sentAt ?? .distantPast) > ($1.messages.last?.sentAt ?? .distantPast) }) { chat in
                    NavigationLink { ConversationView(id: chat.id) } label: {
                        HStack(spacing: 14) {
                            DeviceArtwork(offer:chat.offer,height:56).frame(width:56,height:56).clipped().accessibilityLabel("Gerätebild")
                            VStack(alignment: .leading, spacing: 5) {
                                HStack(alignment:.firstTextBaseline) {
                                    Text(chat.offer.seller).font(.headline)
                                    Spacer()
                                    Text(chat.messages.last?.sentAt.map(GermanDate.message) ?? "–:–").font(.caption).foregroundStyle(.secondary).fixedSize().accessibilityIdentifier("last-message-time")
                                }
                                Text(chat.messages.last?.text ?? "Beginne die Unterhaltung").lineLimit(2).font(.subheadline).foregroundStyle(.secondary)
                            }
                        }.padding(.vertical, 6)
                    }
                } }
            }.listStyle(.plain).navigationTitle("Nachrichten").animation(.snappy,value:archived)
            .navigationDestination(isPresented:Binding(get:{store.pendingConversation != nil},set:{if !$0{store.pendingConversation=nil}})) { if let id=store.pendingConversation {ConversationView(id:id)} }
        }
    }
}
struct ConversationView: View {
    @Environment(AppStore.self) private var store
    let id: String
    @State private var text = ""
    @State private var confirmBlock = false
    private var chat: Conversation? { store.data.chats.first { $0.id == id } }
    var body: some View {
        if let chat {
            ScrollViewReader { proxy in
                ScrollView {
                    VStack(spacing: 14) {
                        NavigationLink { OfferDetail(offer: chat.offer) } label: { Label(chat.offer.title, systemImage: chat.offer.symbol).font(.headline).frame(maxWidth: .infinity).padding().background(Color(.secondarySystemBackground), in: .rect(cornerRadius: 18)) }.buttonStyle(.plain)
                        ForEach(chat.purchaseOffers) { purchase in PurchaseOfferCard(purchase:purchase) }
                        ForEach(chat.messages) { message in HStack { if message.mine { Spacer(minLength: 40) }; Text(message.text).padding(12).foregroundStyle(message.mine ? .white : .primary).background(message.mine ? Color.blue : Color(.secondarySystemBackground), in: .rect(cornerRadius: 18)); if !message.mine { Spacer(minLength: 40) } }.id(message.id).onScrollVisibilityChange(threshold:0.6) { visible in store.markVisible(message,in:id,visible:visible) } }
                    }.padding()
                }.onChange(of: chat.messages.count) { if let last = chat.messages.last { withAnimation { proxy.scrollTo(last.id, anchor: .bottom) } } }
            }
            .onAppear { store.activeConversation=id;Task { await store.presence() } }
            .onDisappear { store.closeConversation(id) }
            .navigationTitle(chat.offer.seller).navigationBarTitleDisplayMode(.inline)
            .toolbar(.hidden, for: .tabBar)
            .toolbar { ToolbarItem(placement:.topBarTrailing) { Menu {
                Button(chat.archived ? "Aus Archiv holen":"Archivieren") { store.setConversation(id,archived:!chat.archived) }
                Button(chat.muted ? "Stummschaltung aufheben":"Stummschalten") { store.setConversation(id,muted:!chat.muted) }
                if store.isBlocked(chat.offer.sellerId) { Button("Blockierung aufheben") { store.unblock(chat.offer.sellerId) } }
                else { Button("Profil blockieren",role:.destructive) { confirmBlock = true } }
            } label: { Image(systemName:"ellipsis") } } }
            .confirmationDialog("\(chat.offer.seller) blockieren?",isPresented:$confirmBlock,titleVisibility:.visible) { Button("Blockieren",role:.destructive) { store.block(chat.offer.sellerId) } }
            .safeAreaInset(edge: .bottom) {
                VStack {
                if store.isBlocked(chat.offer.sellerId) { Text("Dieses Profil ist blockiert.").font(.footnote).foregroundStyle(.secondary) }
                HStack(alignment: .bottom, spacing: 12) {
                    TextField("Nachricht schreiben …", text: $text, axis: .vertical).lineLimit(1...5).padding(.vertical, 12).padding(.leading, 16).accessibilityIdentifier("message-composer")
                    Button("Senden", systemImage: "arrow.up") { Task { if await store.send(String(text.prefix(4000)), to: id) { text = "" } } }.labelStyle(.iconOnly).buttonStyle(.borderedProminent).buttonBorderShape(.circle).padding(6).disabled(text.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty)
                }.background(Color(.systemBackground), in: .rect(cornerRadius: 24))
                .overlay(RoundedRectangle(cornerRadius: 24).stroke(Color(.separator).opacity(0.45), lineWidth: 1))
                .disabled(store.isBlocked(chat.offer.sellerId))
                }.padding(.horizontal, 16).padding(.vertical, 10).background(Color(.systemGroupedBackground))
            }
        }
    }
}
struct AccountView: View {
    @Environment(AppStore.self) private var store
    @State private var confirmLogout = false
    @State private var confirmDelete = false
    @State private var emojiPicker = false
    @State private var pendingUnblock: String?
    @State private var editName = false
    @State private var draftName = ""
    @State private var coverSelection:PhotosPickerItem?
    @State private var uploadingCover=false
    var body: some View {
        @Bindable var store = store
        NavigationStack {
            Form {
                Section {
                    HStack(spacing: 16) { Button { emojiPicker = true } label: { Text(store.data.emoji).font(.system(size:48)).frame(width:72,height:72).background(Color(.secondarySystemBackground),in:Circle()) }.buttonStyle(.plain).accessibilityLabel("Profil-Icon ändern"); Button { draftName=store.data.name;editName=true } label: { Text(store.data.name).font(.title2.bold()) }.buttonStyle(.plain).accessibilityLabel("Name ändern") }.padding(.vertical, 10)
                }
                Section("Profilcover") {
                    if let id=store.coverMediaId {AsyncImage(url:URL(string:"/api/v1/media/"+id,relativeTo:NativeAPI.shared.origin)){image in image.resizable().scaledToFill()}placeholder:{ProgressView()}.frame(height:140).clipped();Button("Cover entfernen",role:.destructive){store.removeCover()}}
                    PhotosPicker(selection:$coverSelection,matching:.images){Label(uploadingCover ? "Bild wird gespeichert …":"Cover auswählen",systemImage:"photo")}.disabled(uploadingCover)
                }
                Section {
                    NavigationLink { FavoritesView() } label: { Label("Favoriten", systemImage: "heart") }
                    NavigationLink { List(store.data.ownOffers) { offer in NavigationLink(offer.title) { OfferDetail(offer: offer) } }.navigationTitle("Meine Inserate").overlay { if store.data.ownOffers.isEmpty { ContentUnavailableView("Noch keine Inserate", systemImage: "storefront") } } } label: { Label("Meine Inserate", systemImage: "storefront") }
                }
                Section {
                    Toggle("Neue Nachrichten per E-Mail",isOn:Binding(get:{store.data.emailNotifications ?? false},set:{store.data.emailNotifications=$0;store.save()}))
                } header: { Text("Benachrichtigungen") } footer: { Text("E-Mail bei Nachrichten, die nach zwei Minuten noch ungelesen sind.") }
                Section {
                    NavigationLink {
                        List {
                            if (store.data.blockedSellers ?? []).isEmpty { Text("Keine blockierten Profile").foregroundStyle(.secondary) }
                            ForEach(store.data.blockedSellers ?? [],id:\.self) { name in HStack { Text(store.blockedNames[name] ?? "Profil");Spacer();Button("Freigeben") { pendingUnblock=name } } }
                        }.navigationTitle("Blockierte Profile")
                        .confirmationDialog("Blockierung aufheben?",isPresented:Binding(get:{pendingUnblock != nil},set:{if !$0{pendingUnblock=nil}}),titleVisibility:.visible){Button("Freigeben"){if let name=pendingUnblock{store.unblock(name)};pendingUnblock=nil}}
                    } label: { Label("Blockierte Profile",systemImage:"person.slash") }
                }
                Section { Button("Abmelden", role: .destructive) { confirmLogout = true } }
                Section { Button("Konto löschen",role:.destructive) {confirmDelete=true} } footer: { Text("Dein Konto wird zwischen Website und iPhone synchronisiert.") }
            }.navigationTitle("Konto")
                .task(id:coverSelection){guard let selected=coverSelection else{return};uploadingCover=true;defer{uploadingCover=false};do{if let data=try await selected.loadTransferable(type:Data.self){await store.uploadCover(data)}}catch{store.error=error.localizedDescription}}
                .alert("Name ändern",isPresented:$editName) {
                    TextField("Name",text:$draftName)
                    Button("Abbrechen",role:.cancel) {}
                    Button("Speichern") { let name=draftName.trimmingCharacters(in:.whitespacesAndNewlines);if !name.isEmpty { store.data.name=String(name.prefix(40));store.save() } }
                }
                .sheet(isPresented:$emojiPicker) {
                    AvatarEmojiPicker(current: store.data.emoji) { emoji in
                        store.data.emoji=emoji;store.save();emojiPicker=false
                    }

                }
                .onChange(of: store.data.name) { store.save() }.onChange(of: store.data.emoji) { store.save() }.onChange(of: store.data.city) { store.save() }
                .alert("Konto dauerhaft löschen?",isPresented:$confirmDelete) { Button("Abbrechen",role:.cancel) {} ; Button("Konto löschen",role:.destructive) {store.deleteAccount()} } message: { Text("Dein Konto und deine Inserate werden dauerhaft gelöscht. Diese Aktion kann nicht rückgängig gemacht werden.") }
                .confirmationDialog("Abmelden?", isPresented: $confirmLogout, titleVisibility: .visible) { Button("Abmelden", role: .destructive) { store.logout() } }
        }
    }
}

struct AvatarEmojiPicker: View {
    let current: String
    let choose: (String) -> Void
    @State private var custom = ""
    private let suggestions = Array("🍏🍎🍐🍊🍋🍒🍇🥝🌸🌻🌵🍀🦊🐱🐶🐼🐨🦁🐸🐙⭐️🌈🎯🎨🚀😀😃😄😁😆😅😂🙂🙃😉😊😎🤩🥳🤖👻👽🐯🐻🐰🐹🐮🐷🐵🐔🐧🦉🦋🐢🐬🐳🦄🐝🌷🌹🌺🌼🌴🌲🍄🌍🌙☀️⚡️🔥❄️🌊🍉🍓🍑🥑🍍🥥🍕🍔🍣🍩🍪☕️⚽️🏀🎾🏈🎱🏆🎸🎹🎮🎲📷💻💎🎈🎁❤️🧡💛💚💙💜🖤🤍🇩🇪🇦🇹🇨🇭")
    private var valid: Bool {
        custom.count == 1 && custom.unicodeScalars.contains { $0.properties.isEmojiPresentation || $0.value == 0xFE0F || $0.value == 0x20E3 }
    }
    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(alignment:.leading,spacing:20) {
                    Text("Wähle ein Emoji oder nutze die Emoji-Tastatur für die gesamte Auswahl deines iPhones.").font(.subheadline).foregroundStyle(.secondary)
                    HStack {
                        TextField("Eigenes Emoji",text:$custom).font(.title).autocorrectionDisabled().accessibilityIdentifier("custom-avatar-emoji")
                        Button("Übernehmen") { choose(custom) }.disabled(!valid)
                    }.padding().background(Color(.secondarySystemBackground),in:.rect(cornerRadius:16))
                    LazyVGrid(columns:Array(repeating:GridItem(.flexible()),count:5),spacing:18) {
                        ForEach(suggestions.map(String.init),id:\.self) { emoji in
                            Button { choose(emoji) } label: { Text(emoji).font(.system(size:36)).frame(width:52,height:52).background(current == emoji ? Color(.secondarySystemBackground):.clear,in:Circle()) }.accessibilityLabel("Icon \(emoji)")
                        }
                    }
                }.padding()
            }.navigationTitle("Profil-Icon").navigationBarTitleDisplayMode(.inline)
        }.presentationDetents([.large])
    }
}

struct PurchaseOfferCard: View {
    @Environment(AppStore.self) private var store
    let purchase: PurchaseOffer
    @State private var confirmAccept=false
    @State private var busy=false
    var body: some View {
        VStack(alignment:.leading,spacing:14) {
            Text(purchase.status=="accepted" ? "Kauf vereinbart" : purchase.status=="declined" ? "Kauf abgelehnt" : "Kaufanfrage").font(.headline)
            Text(Double(purchase.priceCents)/100,format:.currency(code:"EUR").locale(Locale(identifier:"de_DE"))).font(.title.bold())
            if purchase.status=="pending" {
                if purchase.senderId==store.identity { Text("Dein Kauf wartet auf die Bestätigung des Verkäufers.").foregroundStyle(.secondary) }
                else {
                    HStack {
                        Button("Ablehnen") { busy=true;Task { _=await store.resolvePurchase(purchase.id,accept:false);busy=false } }.buttonStyle(.bordered)
                        Spacer()
                        Button("Annehmen") { confirmAccept=true }.buttonStyle(.borderedProminent)
                    }.disabled(busy)
                }
            } else if purchase.status=="accepted" {
                if let resolved=purchase.resolvedAt,let date=ISO8601DateFormatter().date(from:resolved),Date().timeIntervalSince(date)>=172800 {
                    HStack{Button("Positiv bewerten"){store.rate(purchase,positive:true)};Button("Negativ bewerten"){store.rate(purchase,positive:false)}}.buttonStyle(.bordered)
                }
                Text("Das Inserat ist als verkauft markiert. Zahlung und Übergabe müssen noch vereinbart werden; eine Zahlungsabwicklung in der App ist noch nicht eingerichtet.").font(.subheadline).foregroundStyle(.secondary)
            }
        }.padding(20).frame(maxWidth:.infinity,alignment:.leading).background(Color(.secondarySystemBackground),in:.rect(cornerRadius:22))
        .alert("Verkauf bestätigen?",isPresented:$confirmAccept) {
            Button("Abbrechen",role:.cancel) {}
            Button("Verkauf bestätigen") { busy=true;Task { _=await store.resolvePurchase(purchase.id,accept:true);busy=false } }
        } message: { Text("Du bestätigst den Verkauf zu diesem Preis. Das Inserat wird als verkauft markiert und andere offene Kaufanfragen werden abgelehnt. Eine Zahlung wird dadurch nicht ausgelöst.") }
    }
}
