import SwiftUI
import MapKit

extension Color {
    init(catalogHex:String){let clean=catalogHex.replacingOccurrences(of:"#",with:"");let n=UInt64(clean,radix:16) ?? 0xC0C0C5;self.init(red:Double((n>>16)&255)/255,green:Double((n>>8)&255)/255,blue:Double(n&255)/255)}
}
struct DeviceArtwork: View {
    let offer: Offer
    var height: CGFloat = 150
    var body: some View {
        Canvas {context,size in
            let scale=min(size.width/360,size.height/240)
            var c=context;c.translateBy(x:(size.width-360*scale)/2,y:(size.height-240*scale)/2);c.scaleBy(x:scale,y:scale)
            let s=offer.specs ?? [:],model=WebCatalog.shared.model(s["model"])
            let shell=Color(catalogHex:model?.colors.first{$0.id==s["color"]}?.hex ?? "#C0C0C5")
            let seed=Array((s["model",default:offer.title]+"-"+s["color",default:""]).utf16).reduce(0){$0+Int($1)}
            let hues=[200.0,280,40,160,320,20],h=hues[seed%6]
            let colors=[Color(hue:h/360,saturation:0.6,brightness:0.85),Color(hue:hues[(seed+2)%6]/360,saturation:0.65,brightness:0.8),Color(hue:((h+40).truncatingRemainder(dividingBy:360))/360,saturation:0.5,brightness:0.92)]
            func rect(_ x:Double,_ y:Double,_ w:Double,_ h:Double,_ r:Double,_ color:Color){c.fill(Path(roundedRect:CGRect(x:x,y:y,width:w,height:h),cornerRadius:r),with:.color(color))}
            func screen(_ x:Double,_ y:Double,_ w:Double,_ h:Double,_ r:Double){c.fill(Path(roundedRect:CGRect(x:x,y:y,width:w,height:h),cornerRadius:r),with:.linearGradient(Gradient(colors:colors),startPoint:CGPoint(x:x,y:y),endPoint:CGPoint(x:x+w,y:y+h)))}
            if offer.category=="Mac" {rect(48,28,264,158,10,shell);screen(58,38,244,132,4);rect(30,186,300,10,2,shell);rect(140,188,80,4,1,.gray.opacity(0.45))}
            else if offer.category=="iPad" {rect(88,22,184,184,16,shell);screen(98,32,164,164,8)}
            else {rect(138,18,84,196,16,shell);screen(144,26,72,180,12);rect(162,32,36,7,3.5,.black.opacity(0.8))}
            c.fill(Path(ellipseIn:CGRect(x:offer.category=="Mac" ? 110:150,y:220,width:offer.category=="Mac" ? 140:60,height:5)),with:.color(.black.opacity(0.07)))
        }.frame(height:height).accessibilityHidden(true)
    }
}
struct OfferCard: View {
    @Environment(AppStore.self) private var store
    let offer: Offer
    var place: CatalogPlace? = nil
    @ScaledMetric private var titleHeight = 54.0
    private var location: String {
        guard let place,let other=WebCatalog.shared.place(postal:offer.specs?["postalCode"],city:offer.city) else{return offer.city}
        let distance=place.distance(to:other)
        return "\(offer.city) (\(distance<1 ? "< 1" : String(Int(distance.rounded()))) km)"
    }
    var body: some View {
        VStack(spacing:10) {
            HStack(spacing:4) {
                Text(location).font(.caption2).foregroundStyle(.secondary).lineLimit(2)
                Spacer(minLength:0)
                Button{store.toggleFavorite(offer)}label:{Image(systemName:store.data.favorites.contains(offer.id) ? "heart.fill":"heart").foregroundStyle(store.data.favorites.contains(offer.id) ? .red:.secondary).frame(width:34,height:34).background(.background,in:Circle()).shadow(color:.black.opacity(0.07),radius:4,y:2)}.buttonStyle(.plain).accessibilityLabel(store.data.favorites.contains(offer.id) ? "Favorit entfernen":"Als Favorit merken")
            }
            NavigationLink { OfferDetail(offer:offer) } label: {
                VStack(spacing:10){DeviceArtwork(offer:offer)
                    Text(offer.displayTitle).font(.system(size:14)).multilineTextAlignment(.center).foregroundStyle(.primary).lineLimit(3).frame(height:titleHeight,alignment:.center)
                    Text(offer.price,format:.currency(code:"EUR")).font(.system(size:19,weight:.semibold)).foregroundStyle(.primary)
                }.frame(maxWidth:.infinity)
            }.buttonStyle(.plain)
            Spacer(minLength:0)
        }.padding(12).frame(maxWidth:.infinity,minHeight:310,alignment:.top).background(Color(.systemBackground)).overlay(alignment:.trailing){Rectangle().fill(Color(.systemGray4)).frame(width:1)}.overlay(alignment:.bottom){Rectangle().fill(Color(.systemGray4)).frame(height:1)}
    }
}
struct DiscoverView: View {
    @Environment(AppStore.self) private var store
    @State private var query=""
    @State private var filters=CatalogFilterState()
    @State private var showFilters=false
    private var results:[Offer]{filters.results(store.offers,query:query)}
    private var sortTitle:String{filters.sort=="price-asc" ? "Preis aufsteigend":filters.sort=="nearest" ? "Entfernung":"Neueste zuerst"}
    var body: some View {
        NavigationStack {
            ScrollView {
                if results.isEmpty {ContentUnavailableView("Keine passenden Inserate",systemImage:"magnifyingglass",description:Text("Passe deine Filter oder die Suche an."))}
                LazyVGrid(columns:[GridItem(.flexible(),spacing:0),GridItem(.flexible(),spacing:0)],spacing:0){ForEach(results){OfferCard(offer:$0,place:filters.place)}}
            }
            .safeAreaInset(edge:.top,spacing:0){
                ScrollView(.horizontal){HStack(spacing:8){
                    Button{showFilters=true}label:{Image(systemName:"slider.horizontal.3").frame(width:42,height:42).background(Color(.secondarySystemBackground),in:Circle())}.buttonStyle(.plain).accessibilityLabel("Filter")
                    Menu {Button("Neueste zuerst"){filters.sort="newest"};Button("Preis aufsteigend"){filters.sort="price-asc"};Button("Entfernung"){filters.sort="nearest"}.disabled(filters.place==nil)} label:{HStack(spacing:6){Text(sortTitle);Image(systemName:"chevron.up.chevron.down").font(.caption)}.font(.subheadline).padding(.horizontal,13).frame(height:42).background(Color(.secondarySystemBackground),in:Capsule())}.foregroundStyle(.primary)
                    ForEach([CatalogChoice(id:"",label:"Alle")]+WebCatalog.shared.categories){item in Button{filters.changeCategory(item.id)}label:{Text(item.label).font(.subheadline).padding(.horizontal,18).frame(height:42).background(Color(.secondarySystemBackground),in:Capsule()).overlay(Capsule().stroke(filters.category==item.id ? Color(.separator):.clear,lineWidth:1))}.buttonStyle(.plain).foregroundStyle(filters.category==item.id ? .primary:.secondary)}
                }.padding(.horizontal,12).padding(.vertical,10)}.scrollIndicators(.hidden).background(.background).overlay(alignment:.bottom){Divider()}
            }
            .toolbar(.hidden, for:.navigationBar)
            .navigationDestination(for:Offer.self){OfferDetail(offer:$0)}
            .sheet(isPresented:$showFilters){CatalogFilterSheet(filters:$filters,count:results.count)}
        }
    }
}
struct FavoritesView: View {
    @Environment(AppStore.self) private var store
    var body: some View {
            ScrollView {
                if store.data.favorites.isEmpty { ContentUnavailableView("Deine Fundstücke", systemImage: "heart", description: Text("Tippe bei einem Angebot auf das Herz. Hier findest du es wieder.")) }
                else { LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible())], spacing: 24) { ForEach(store.offers.filter { store.data.favorites.contains($0.id) }) { OfferCard(offer: $0) } }.padding() }
            }.navigationTitle("Favoriten").navigationDestination(for: Offer.self) { OfferDetail(offer: $0) }
    }
}
struct OfferDetail: View {
    @Environment(AppStore.self) private var store
    private let initialOffer:Offer
    init(offer:Offer){initialOffer=offer}
    private var offer:Offer {store.data.ownOffers.first{$0.id==initialOffer.id} ?? store.publicOffers.first{$0.id==initialOffer.id} ?? initialOffer}
    @State private var showChat = false
    @State private var confirmPurchase = false
    @State private var purchaseBusy = false
    @State private var purchaseKey = UUID().uuidString
    @State private var chatId = ""
    @State private var showMap = false
    @State private var showRank = false
    @State private var reportSheet = false
    @State private var reportReason = "Spam oder Betrugsverdacht"
    @State private var confirmDelete = false
    @State private var editingListing = false
    @State private var note = ""
    @State private var precisePlace: CatalogPlace?
    private var specs: [String:String] { offer.specs ?? [:] }
    private var seller: CatalogSeller? { store.profiles[offer.sellerId] }
    private var place: CatalogPlace? { precisePlace ?? WebCatalog.shared.place(postal:specs["postalCode"],city:offer.city) }
    private var hardware: [HardwareRow] { WebCatalog.shared.hardware?["\(specs["model"] ?? "")|\(specs["size"] ?? "")"] ?? WebCatalog.shared.hardware?["\(specs["model"] ?? "")|"] ?? [] }
    private func contact(buy: Bool) {
        guard !store.isBlocked(offer.sellerId) else { return }
        if buy {confirmPurchase=true;return}
        Task { if let id = await store.startChat(offer) { chatId=id;showChat=true } }
    }
    var body: some View {
        ScrollView {
            VStack(alignment:.leading,spacing:28) {
                DeviceArtwork(offer:offer)
                VStack(alignment:.leading,spacing:24) {
                    Text(offer.displayTitle).font(.title.bold()).fixedSize(horizontal:false,vertical:true)
                    Text(offer.price,format:.currency(code:"EUR").locale(Locale(identifier:"de_DE"))).font(.largeTitle.bold())
                }
                if !offer.detail.isEmpty { Text(offer.detail).lineSpacing(6) }
                VStack(alignment:.leading,spacing:16) {
                    ForEach(["year","chip","size","memory","storage","color","connectivity","simLock","keyboard","condition","packaging","warrantyUntil","capacity","cycles","shipping"],id:\.self) { key in
                        if let value=specs[key] {
                            DetailRow(label:["year":"Modelljahr","chip":"Chip","size":"Größe","memory":"Arbeitsspeicher","storage":"Speicher","color":"Farbe","connectivity":"Verbindung","simLock":"SIM-Lock","keyboard":"Tastaturlayout","condition":"Zustand","packaging":"Originalverpackung","warrantyUntil":"Garantie bis","capacity":"Batteriekapazität (%)","cycles":"Ladezyklen","shipping":"Versand"][key] ?? key,
                                      value:key=="capacity" && specs["capacityAtMost"]=="yes" ? "70% oder weniger" : key=="warrantyUntil" ? GermanDate.date(value) : WebCatalog.shared.choices(key,values:specs).first{$0.id==value}?.label ?? value)
                        }
                    }
                }
                if !hardware.isEmpty {
                    VStack(alignment:.leading,spacing:16) {
                        ForEach(hardware,id:\.self) { DetailRow(label:$0.label,value:$0.value) }
                    }
                }
                VStack(alignment:.leading,spacing:14) {
                    Text([specs["showExactAddress"] == "yes" ? specs["street"] : nil,specs["postalCode"],offer.city].compactMap{$0}.joined(separator:" ")).font(.headline)
                    if let place {
                        ListingMap(place:place).id(place).allowsHitTesting(false).frame(height:220).clipShape(.rect(cornerRadius:18)).accessibilityIdentifier("listing-map")
                        HStack {
                            Button { showMap=true } label: { Text("Vollbild").frame(maxWidth:.infinity).padding(.vertical,8) }
                            Link(destination:place.appleMapsURL) { Text("Apple Karten").frame(maxWidth:.infinity).padding(.vertical,8) }
                        }.buttonStyle(.bordered).tint(.primary)
                        Text(precisePlace != nil ? "Die genaue Adresse wird mit Zustimmung des Anbieters angezeigt." : "Der Punkt zeigt nur Stadt und PLZ. Für den Treffpunkt nimm direkt Kontakt auf.").font(.footnote).foregroundStyle(.secondary)
                    } else { Text("Für diesen Ort sind noch keine Kartenkoordinaten hinterlegt.").font(.footnote).foregroundStyle(.secondary) }
                }.padding().background(Color(.secondarySystemBackground),in:.rect(cornerRadius:22))
                VStack(alignment:.leading,spacing:20) {
                    HStack(alignment:.top) {
                        VStack(alignment:.leading) {Text("Anzeigen-ID: \(offer.number ?? offer.id)").font(.caption).foregroundStyle(.secondary);TextField("Private Notiz",text:$note).onSubmit{store.setNote(note,for:offer.id)};Button("Notiz speichern"){store.setNote(note,for:offer.id)}.font(.caption)}
                        NavigationLink { NativeSellerView(name:offer.seller,userId:offer.sellerId) } label: {
                            HStack { Text(offer.sellerId==store.identity ? store.data.emoji : seller?.emoji ?? "🍏").font(.largeTitle);Text(offer.seller).font(.headline);Image(systemName:"arrow.up.right.square").font(.subheadline) }
                        }.buttonStyle(.plain)
                        Spacer(minLength:6)
                        if let date=seller?.joinedAt { Text("Mitglied seit\n\(GermanDate.date(date))").font(.caption).foregroundStyle(.secondary).multilineTextAlignment(.trailing) }
                    }
                    if let rep=seller?.reputation {
                        Button { showRank=true } label: {
                            HStack(alignment:.top,spacing:8) {
                                VStack(spacing:8) { Image(systemName:"storefront").font(.title);Text(rep.rank.label).font(.caption) }.frame(maxWidth:.infinity)
                                VStack(spacing:8) { Text("\(rep.ratingCount)").font(.title.bold());Text("Bewertungen").font(.caption) }.frame(maxWidth:.infinity)
                                VStack(spacing:8) { Text(rep.percentPositive.map{"\($0)%"} ?? "–").font(.title.bold());Text("Positives Feedback").font(.caption) }.frame(maxWidth:.infinity)
                            }.multilineTextAlignment(.center).foregroundStyle(.primary)
                        }.buttonStyle(.plain).accessibilityLabel("Auszeichnungen anzeigen")
                    }
                    if let bio=(offer.sellerId==store.identity ? store.data.bio : seller?.bio),!bio.isEmpty { Text(bio).font(.subheadline) }
                }.padding().background(Color(.secondarySystemBackground),in:.rect(cornerRadius:22))
                VStack(spacing:16) {
                    DetailRow(label:"Anzeigen-ID",value:offer.number ?? offer.id)
                    if let created=specs["createdAt"] { DetailRow(label:"Veröffentlicht",value:GermanDate.date(created)) }
                }
            }.padding(20)
        }
        .toolbar(.hidden,for:.tabBar)
        .toolbar(.visible,for:.navigationBar)
        .navigationTitle("").navigationBarTitleDisplayMode(.inline)
        .toolbarBackground(.hidden,for:.navigationBar,.tabBar)
        .toolbar { ToolbarItemGroup(placement:.topBarTrailing) {
            Button("Melden",systemImage:"flag") {reportSheet=true}
            ShareLink(item:URL(string:"https://usedfruit.de/listing/\(offer.id)")!) { Image(systemName:"square.and.arrow.up") }.accessibilityLabel("Inserat teilen")
            Button { store.toggleFavorite(offer) } label: { Image(systemName:store.data.favorites.contains(offer.id) ? "heart.fill":"heart").foregroundStyle(store.data.favorites.contains(offer.id) ? .red:.primary) }.accessibilityLabel("Favorit umschalten")
        } }
        .safeAreaInset(edge:.bottom) {
            if offer.sellerId == store.identity {
                HStack { Button("Bearbeiten"){editingListing=true};Button("Reservieren"){store.updateListing(offer,status:"reserved")};Button("Aktivieren"){store.updateListing(offer,status:"public")};Button("Löschen",role:.destructive){confirmDelete=true} }.buttonStyle(.bordered).padding()
            } else {
            HStack(spacing:12) {
                Button { contact(buy:false) } label: { Text("Nachricht").frame(maxWidth:.infinity).padding(.vertical,8) }.buttonStyle(.glass).tint(.primary)
                Button { contact(buy:true) } label: { Text("Kaufen").frame(maxWidth:.infinity).padding(.vertical,8) }.buttonStyle(.glassProminent).tint(.blue)
            }.buttonBorderShape(.capsule).disabled(purchaseBusy || store.isBlocked(offer.sellerId) || offer.sellerId==store.identity).padding()
            }
        }
        .alert("Kauf bestätigen",isPresented:$confirmPurchase) {
            Button("Abbrechen",role:.cancel) {}
            Button("Kaufen") {
                purchaseBusy=true
                Task {
                    if let id=await store.submitPurchase(offer,key:purchaseKey) { chatId=id;showChat=true;purchaseKey=UUID().uuidString }
                    purchaseBusy=false
                }
            }
        } message: {
            Text("Du kaufst für \(offer.price.formatted(.currency(code: "EUR").locale(Locale(identifier: "de_DE")))) das Gerät \(offer.displayTitle). Der Verkäufer muss den Verkauf noch bestätigen. Hier wird noch keine Zahlung ausgelöst.")
        }
        .task(id:offer.id) {
            guard specs["showExactAddress"]=="yes",let street=specs["street"],!street.isEmpty,let base=place else { return }
            let results=try? await CLGeocoder().geocodeAddressString("\(street), \(base.postalCode) \(base.city), Deutschland")
            if let coordinate=results?.first?.location?.coordinate {
                precisePlace=CatalogPlace(postalCode:base.postalCode,city:base.city,state:base.state,lat:coordinate.latitude,lng:coordinate.longitude)
            }
        }
        .confirmationDialog("Inserat löschen?",isPresented:$confirmDelete,titleVisibility:.visible){Button("Löschen",role:.destructive){store.removeListing(offer)}}
        .sheet(isPresented:$editingListing){CreateOfferView(editing:offer)}
        .sheet(isPresented:$reportSheet){NavigationStack{Form{TextField("Grund der Meldung",text:$reportReason,axis:.vertical);Button("Meldung senden"){store.report(offer,reason:reportReason);reportSheet=false}}.navigationTitle("Anzeige melden")}}
        .task { note=store.notes[offer.id] ?? "";await store.loadProfile(offer.sellerId) }
        .navigationDestination(isPresented:$showChat) { ConversationView(id:chatId) }
        .fullScreenCover(isPresented:$showMap) {
            if let place { FullScreenListingMap(place:place) }
        }
        .sheet(isPresented:$showRank) {
            if let rep=seller?.reputation {
                VStack(spacing:0) {
                    HStack { DismissCircle { showRank=false };Spacer();Text("Auszeichnungen").font(.headline);Spacer();Color.clear.frame(width:52,height:52) }.padding(16)
                    List(rep.medals) { medal in Label { VStack(alignment:.leading,spacing:5) { Text(medal.label).font(.headline);Text(medal.how).font(.subheadline).foregroundStyle(.secondary) } } icon: { Image(systemName:medal.earned ? "checkmark.seal.fill":"seal").foregroundStyle(medal.earned ? Color.accentColor:.secondary) } }.listStyle(.plain)
                }.toolbar(.hidden,for:.tabBar,.navigationBar)

            }
        }
    }
}
struct DetailRow: View {
    let label: String; let value: String
    var body: some View { VStack(spacing:12) { HStack(alignment:.top,spacing:20) { Text(label).foregroundStyle(.secondary);Spacer(minLength:0);Text(value).multilineTextAlignment(.trailing) };Divider() }.font(.subheadline) }
}
struct ListingMap: View {
    let place: CatalogPlace
    var body: some View {
        Map(initialPosition:.region(MKCoordinateRegion(center:CLLocationCoordinate2D(latitude:place.lat,longitude:place.lng),span:MKCoordinateSpan(latitudeDelta:0.035,longitudeDelta:0.035)))) {
            Marker(place.city,coordinate:CLLocationCoordinate2D(latitude:place.lat,longitude:place.lng))
        }
    }
}
struct NativeSellerView: View {
    @Environment(AppStore.self) private var store
    let name: String
    let userId: String
    var body: some View {
        ScrollView {
            VStack(spacing:18) {
                if userId==store.identity { Text(store.data.emoji).font(.system(size:64));Text(name).font(.title.bold());Text(store.data.bio ?? "") }
                else if let seller=store.profiles[userId] { Text(seller.emoji).font(.system(size:64));Text(name).font(.title.bold());Text(seller.bio);Text("Mitglied seit \(GermanDate.date(seller.joinedAt))").font(.footnote).foregroundStyle(.secondary) }
                LazyVGrid(columns:[GridItem(.flexible(),spacing:0),GridItem(.flexible(),spacing:0)],spacing:0) { ForEach(store.offers.filter{$0.sellerId==userId}) { OfferCard(offer:$0) } }
            }
        }.task { await store.loadProfile(userId) }.navigationTitle("Anbieter").navigationBarTitleDisplayMode(.inline).navigationDestination(for:Offer.self) { OfferDetail(offer:$0) }
    }
}

extension CatalogPlace {
    var appleMapsURL: URL {
        var url=URLComponents(string:"https://maps.apple.com/")!
        url.queryItems=[URLQueryItem(name:"ll",value:"\(lat),\(lng)"),URLQueryItem(name:"q",value:label)]
        return url.url!
    }
}
struct DismissCircle: View {
    var action: () -> Void
    var body: some View {
        Button(action:action) { Image(systemName:"xmark").font(.system(size:20,weight:.semibold)).foregroundStyle(.primary).frame(width:52,height:52) }
            .buttonStyle(.glass).buttonBorderShape(.circle).accessibilityLabel("Schließen")
    }
}
struct FullScreenListingMap: View {
    let place: CatalogPlace
    @Environment(\.dismiss) private var dismiss
    var body: some View {
        ZStack(alignment:.topLeading) {
            ListingMap(place:place).ignoresSafeArea(.all)
            DismissCircle { dismiss() }.padding(.leading,20).padding(.top,12)
        }.statusBarHidden().accessibilityIdentifier("fullscreen-listing-map")
    }
}
