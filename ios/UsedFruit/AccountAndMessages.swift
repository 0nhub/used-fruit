import SwiftUI

struct InboxView: View {
    @Environment(AppStore.self) private var store
    var body: some View {
        NavigationStack {
            Group {
                if store.data.chats.isEmpty { ContentUnavailableView("Hier beginnt der Austausch", systemImage: "bubble.left.and.bubble.right", description: Text("Öffne ein Inserat und tippe auf „Nachricht schreiben“.")) }
                else { List(store.data.chats) { chat in
                    NavigationLink { ConversationView(id: chat.id) } label: {
                        HStack(spacing: 14) {
                            Image(systemName: chat.offer.symbol).font(.title2).frame(width: 48, height: 52).background(Color(.secondarySystemBackground), in: .rect(cornerRadius: 12))
                            VStack(alignment: .leading, spacing: 4) { Text(chat.offer.seller).font(.headline); Text(chat.offer.title).font(.subheadline); Text(chat.messages.last?.text ?? "Beginne die Unterhaltung").lineLimit(1).font(.caption).foregroundStyle(.secondary) }
                        }.padding(.vertical, 6)
                    }
                } }
            }.navigationTitle("Nachrichten")
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
                        Text("Lokale Demo · Nachrichten werden nicht versendet").font(.caption).foregroundStyle(.secondary)
                        ForEach(chat.messages) { message in HStack { if message.mine { Spacer(minLength: 40) }; Text(message.text).padding(12).foregroundStyle(message.mine ? .white : .primary).background(message.mine ? Color.blue : Color(.secondarySystemBackground), in: .rect(cornerRadius: 18)); if !message.mine { Spacer(minLength: 40) } }.id(message.id) }
                    }.padding()
                }.onChange(of: chat.messages.count) { if let last = chat.messages.last { withAnimation { proxy.scrollTo(last.id, anchor: .bottom) } } }
            }
            .navigationTitle(chat.offer.seller).navigationBarTitleDisplayMode(.inline)
            .toolbar { ToolbarItem(placement:.topBarTrailing) { Menu {
                if store.isBlocked(chat.offer.seller) { Button("Blockierung aufheben") { store.unblock(chat.offer.seller) } }
                else { Button("Profil blockieren",role:.destructive) { confirmBlock = true } }
            } label: { Image(systemName:"ellipsis") } } }
            .confirmationDialog("\(chat.offer.seller) blockieren?",isPresented:$confirmBlock,titleVisibility:.visible) { Button("Blockieren",role:.destructive) { store.block(chat.offer.seller) } }
            .safeAreaInset(edge: .bottom) {
                VStack {
                if store.isBlocked(chat.offer.seller) { Text("Dieses Profil ist blockiert.").font(.footnote).foregroundStyle(.secondary) }
                HStack {
                    TextField("Nachricht", text: $text, axis: .vertical).lineLimit(1...5).padding(12).background(Color(.secondarySystemBackground), in: Capsule())
                    Button("Senden", systemImage: "arrow.up") { store.send(String(text.prefix(4000)), to: id); text = "" }.labelStyle(.iconOnly).buttonStyle(.glassProminent).disabled(text.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty)
                }.disabled(store.isBlocked(chat.offer.seller))
                }.padding().background(.ultraThinMaterial)
            }
        }
    }
}
struct AccountView: View {
    @Environment(AppStore.self) private var store
    @State private var confirmLogout = false
    @State private var emojiPicker = false
    @State private var pendingUnblock: String?
    var body: some View {
        @Bindable var store = store
        NavigationStack {
            Form {
                Section {
                    HStack(spacing: 16) { Button { emojiPicker = true } label: { Text(store.data.emoji).font(.system(size:48)).frame(width:72,height:72).background(Color(.secondarySystemBackground),in:Circle()) }.buttonStyle(.plain).accessibilityLabel("Profil-Icon ändern"); VStack(alignment: .leading) { Text(store.data.name).font(.title2.bold()); Text(store.demo ? "Test-Account" : "Mit Apple angemeldet").foregroundStyle(.secondary) } }.padding(.vertical, 10)
                }
                Section("Dein Profil") {
                    TextField("Name", text: $store.data.name)
                    TextField("Standort (optional)", text: $store.data.city)
                    TextField("Kurzbeschreibung (optional)",text:Binding(get:{store.data.bio ?? ""},set:{store.data.bio=String($0.prefix(220));store.save()}),axis:.vertical).lineLimit(2...4)
                }
                Section {
                    NavigationLink { FavoritesView() } label: { Label("Favoriten", systemImage: "heart") }
                    NavigationLink { List(store.data.ownOffers) { offer in NavigationLink(offer.title) { OfferDetail(offer: offer) } }.navigationTitle("Meine Inserate").overlay { if store.data.ownOffers.isEmpty { ContentUnavailableView("Noch keine Inserate", systemImage: "storefront") } } } label: { Label("Meine Inserate", systemImage: "storefront") }
                    Link(destination: URL(string: "https://usedfruit.de/datenschutz")!) { Label("Datenschutz", systemImage: "hand.raised") }
                    Link(destination: URL(string: "https://usedfruit.de/impressum")!) { Label("Impressum", systemImage: "info.circle") }
                }
                Section {
                    Toggle("Neue Nachrichten per E-Mail",isOn:Binding(get:{store.data.emailNotifications ?? false},set:{store.data.emailNotifications=$0;store.save()}))
                } header: { Text("Benachrichtigungen") } footer: { Text("Diese Auswahl wird lokal vorgemerkt. E-Mail-Versand ist erst nach Anbindung der gemeinsamen API verfügbar.") }
                Section {
                    NavigationLink {
                        List {
                            if (store.data.blockedSellers ?? []).isEmpty { Text("Keine blockierten Profile").foregroundStyle(.secondary) }
                            ForEach(store.data.blockedSellers ?? [],id:\.self) { name in HStack { Text(name);Spacer();Button("Freigeben") { pendingUnblock=name } } }
                        }.navigationTitle("Blockierte Profile")
                        .confirmationDialog("Blockierung aufheben?",isPresented:Binding(get:{pendingUnblock != nil},set:{if !$0{pendingUnblock=nil}}),titleVisibility:.visible){Button("Freigeben"){if let name=pendingUnblock{store.unblock(name)};pendingUnblock=nil}}
                    } label: { Label("Blockierte Profile",systemImage:"person.slash") }
                }
                Section { Button("Abmelden", role: .destructive) { confirmLogout = true } } footer: { Text("iPhone-Prototyp · Daten bleiben auf diesem Gerät. Noch keine gemeinsame Datenbank mit der Website.") }
            }.navigationTitle("Konto")
                .sheet(isPresented:$emojiPicker) {
                    NavigationStack {
                        ScrollView { LazyVGrid(columns:Array(repeating:GridItem(.flexible()),count:5),spacing:18) {
                            ForEach(["🍏","🍎","🍐","🍊","🍋","🍒","🍇","🥝","🌸","🌻","🌵","🍀","🦊","🐱","🐶","🐼","🐨","🦁","🐸","🐙","⭐️","🌈","🎯","🎨","🚀"],id:\.self) { emoji in
                                Button {store.data.emoji=emoji;store.save();emojiPicker=false} label:{Text(emoji).font(.system(size:36)).frame(width:52,height:52).background(store.data.emoji==emoji ? Color(.secondarySystemBackground):.clear,in:Circle())}.accessibilityLabel("Icon \(emoji)")
                            }
                        }.padding() }.navigationTitle("Profil-Icon").navigationBarTitleDisplayMode(.inline).toolbar{Button("Fertig"){emojiPicker=false}}
                    }.presentationDetents([.medium,.large])
                }
                .onChange(of: store.data.name) { store.save() }.onChange(of: store.data.emoji) { store.save() }.onChange(of: store.data.city) { store.save() }
                .confirmationDialog("Abmelden?", isPresented: $confirmLogout, titleVisibility: .visible) { Button("Abmelden", role: .destructive) { store.logout() } }
        }
    }
}
