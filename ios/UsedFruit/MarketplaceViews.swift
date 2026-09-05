import SwiftUI
import MapKit

extension Color {
    init(catalogHex:String){let clean=catalogHex.replacingOccurrences(of:"#",with:"");let n=UInt64(clean,radix:16) ?? 0xC0C0C5;self.init(red:Double((n>>16)&255)/255,green:Double((n>>8)&255)/255,blue:Double(n&255)/255)}
}
struct DeviceArtwork: View {
    let offer: Offer
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
        }.frame(height:150).accessibilityHidden(true)
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
                Label(location,systemImage:"mappin").font(.caption2).foregroundStyle(.secondary).lineLimit(2)
                Spacer(minLength:0)
                Button{store.toggleFavorite(offer)}label:{Image(systemName:store.data.favorites.contains(offer.id) ? "heart.fill":"heart").foregroundStyle(store.data.favorites.contains(offer.id) ? .red:.secondary).frame(width:34,height:34).background(.background,in:Circle()).shadow(color:.black.opacity(0.07),radius:4,y:2)}.buttonStyle(.plain).accessibilityLabel(store.data.favorites.contains(offer.id) ? "Favorit entfernen":"Als Favorit merken")
            }
            NavigationLink(value:offer) {
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
                    Button{showFilters=true}label:{Image(systemName:"slider.horizontal.3").frame(width:42,height:42).background(Color(.secondarySystemBackground),in:Circle()).overlay(alignment:.topTrailing){if filters.activeCount>0{Text("\(filters.activeCount)").font(.caption2).padding(4).background(.blue,in:Circle()).foregroundStyle(.white)}}}.buttonStyle(.plain).accessibilityLabel("Filter")
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
    let offer: Offer
    @State private var showChat = false
    @State private var showMap = false
    @State private var showRank = false
    private var specs: [String:String] { offer.specs ?? [:] }
    private var seller: CatalogSeller? { WebCatalog.shared.sellers?[offer.seller] }
    private var place: CatalogPlace? { WebCatalog.shared.place(postal:specs["postalCode"],city:offer.city) }
    private var hardware: [HardwareRow] { WebCatalog.shared.hardware?["\(specs["model"] ?? "")|\(specs["size"] ?? "")"] ?? WebCatalog.shared.hardware?["\(specs["model"] ?? "")|"] ?? [] }
    private func contact(buy: Bool) {
        guard !store.isBlocked(offer.seller) else { return }
        store.startChat(offer)
        if buy { store.send("Kaufen",to:offer.id) }
        showChat=true
    }
    var body: some View {
        ScrollView {
            VStack(alignment:.leading,spacing:28) {
                HStack {
                    Spacer()
                    ShareLink(item:URL(string:"https://usedfruit.de/listing/\(offer.id)")!) { Image(systemName:"square.and.arrow.up").frame(width:44,height:44).background(.background,in:Circle()).shadow(color:.black.opacity(0.08),radius:4,y:2) }.foregroundStyle(.primary).accessibilityLabel("Inserat teilen")
                    Button { store.toggleFavorite(offer) } label: {
                        Image(systemName:store.data.favorites.contains(offer.id) ? "heart.fill":"heart").foregroundStyle(store.data.favorites.contains(offer.id) ? .red:.primary).frame(width:44,height:44).background(.background,in:Circle()).shadow(color:.black.opacity(0.08),radius:4,y:2)
                    }.buttonStyle(.plain).accessibilityLabel("Favorit umschalten")
                }
                DeviceArtwork(offer:offer)
                VStack(alignment:.leading,spacing:24) {
                    Text(offer.displayTitle).font(.title.bold()).fixedSize(horizontal:false,vertical:true)
                    Text(offer.price,format:.currency(code:"EUR").locale(Locale(identifier:"de_DE"))).font(.largeTitle.bold())
                }
                if !offer.detail.isEmpty { Text(offer.detail).lineSpacing(6) }
                VStack(alignment:.leading,spacing:16) {
                    Text("Angaben zum Inserat").font(.title3.bold())
                    ForEach(["year","chip","size","memory","storage","color","connectivity","simLock","keyboard","condition","packaging","warrantyUntil","capacity","cycles","shipping"],id:\.self) { key in
                        if let value=specs[key] {
                            DetailRow(label:["year":"Modelljahr","chip":"Chip","size":"Größe","memory":"Arbeitsspeicher","storage":"Speicher","color":"Farbe","connectivity":"Verbindung","simLock":"SIM-Lock","keyboard":"Tastaturlayout","condition":"Zustand","packaging":"Originalverpackung","warrantyUntil":"Garantie bis","capacity":"Batteriekapazität (%)","cycles":"Ladezyklen","shipping":"Versand"][key] ?? key,
                                      value:key=="warrantyUntil" ? GermanDate.date(value) : WebCatalog.shared.choices(key,values:specs).first{$0.id==value}?.label ?? value)
                        }
                    }
                }
                if !hardware.isEmpty {
                    VStack(alignment:.leading,spacing:16) {
                        Text("Technische Daten").font(.title3.bold())
                        ForEach(hardware,id:\.self) { DetailRow(label:$0.label,value:$0.value) }
                    }
                }
                VStack(alignment:.leading,spacing:14) {
                    Label([specs["postalCode"],offer.city].compactMap{$0}.joined(separator:" "),systemImage:"mappin.and.ellipse").font(.headline)
                    if let place {
                        ListingMap(place:place).allowsHitTesting(false).frame(height:220).clipShape(.rect(cornerRadius:18)).accessibilityIdentifier("listing-map")
                        HStack {
                            Button("Vollbild",systemImage:"arrow.up.left.and.arrow.down.right") { showMap=true }
                            Spacer()
                            Link("Apple Karten",destination:URL(string:"https://maps.apple.com/?ll=\(place.lat),\(place.lng)")!)
                        }.buttonStyle(.bordered).tint(.primary)
                        Text("Der Punkt zeigt nur Stadt und PLZ. Für den Treffpunkt nimm direkt Kontakt auf.").font(.footnote).foregroundStyle(.secondary)
                    } else { Text("Für diesen Ort sind noch keine Kartenkoordinaten hinterlegt.").font(.footnote).foregroundStyle(.secondary) }
                }.padding().background(Color(.secondarySystemBackground),in:.rect(cornerRadius:22))
                VStack(alignment:.leading,spacing:20) {
                    HStack(alignment:.top) {
                        NavigationLink { NativeSellerView(name:offer.seller) } label: {
                            HStack { Text(offer.seller==store.data.name ? store.data.emoji : seller?.emoji ?? "🍏").font(.largeTitle);Text(offer.seller).font(.headline);Image(systemName:"arrow.up.right.square").font(.subheadline) }
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
                    if let bio=(offer.seller==store.data.name ? store.data.bio : seller?.bio),!bio.isEmpty { Text(bio).font(.subheadline) }
                }.padding().background(Color(.secondarySystemBackground),in:.rect(cornerRadius:22))
                VStack(spacing:16) {
                    DetailRow(label:"Anzeigen-ID",value:offer.id)
                    if let created=specs["createdAt"] { DetailRow(label:"Veröffentlicht",value:GermanDate.date(created)) }
                }
                Text("Lokaler Prototyp: Kaufabsichten und Nachrichten werden nur auf diesem Gerät gespeichert.").font(.footnote).foregroundStyle(.secondary)
            }.padding(20)
        }
        .toolbar(.visible,for:.navigationBar)
        .navigationTitle("Inserat").navigationBarTitleDisplayMode(.inline)
        .safeAreaInset(edge:.bottom) {
            HStack(spacing:12) {
                Button { contact(buy:false) } label: { Text("Nachricht").frame(maxWidth:.infinity).padding(.vertical,8) }.buttonStyle(.bordered).tint(.primary)
                Button { contact(buy:true) } label: { Text("Kaufen").frame(maxWidth:.infinity).padding(.vertical,8) }.buttonStyle(.borderedProminent).tint(.blue)
            }.buttonBorderShape(.capsule).disabled(store.isBlocked(offer.seller)).padding().background(.bar)
        }
        .navigationDestination(isPresented:$showChat) { ConversationView(id:offer.id) }
        .sheet(isPresented:$showMap) {
            if let place { ListingMap(place:place).ignoresSafeArea().overlay(alignment:.topLeading) { Button("Schließen",systemImage:"xmark") { showMap=false }.labelStyle(.iconOnly).buttonStyle(.bordered).buttonBorderShape(.circle).padding(20) } }
        }
        .sheet(isPresented:$showRank) {
            if let rep=seller?.reputation {
                NavigationStack { List(rep.medals) { medal in Label { VStack(alignment:.leading,spacing:5) { Text(medal.label).font(.headline);Text(medal.how).font(.subheadline).foregroundStyle(.secondary) } } icon: { Image(systemName:medal.earned ? "checkmark.seal.fill":"seal").foregroundStyle(medal.earned ? Color.accentColor:.secondary) } }.navigationTitle("Auszeichnungen").toolbar { Button("Fertig") { showRank=false } } }
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
    var body: some View {
        ScrollView {
            VStack(spacing:18) {
                if name==store.data.name { Text(store.data.emoji).font(.system(size:64));Text(name).font(.title.bold());Text(store.data.bio ?? "") }
                else if let seller=WebCatalog.shared.sellers?[name] { Text(seller.emoji).font(.system(size:64));Text(name).font(.title.bold());Text(seller.bio);Text("Mitglied seit \(GermanDate.date(seller.joinedAt))").font(.footnote).foregroundStyle(.secondary) }
                LazyVGrid(columns:[GridItem(.flexible(),spacing:0),GridItem(.flexible(),spacing:0)],spacing:0) { ForEach(store.offers.filter{$0.seller==name}) { OfferCard(offer:$0) } }
            }
        }.navigationTitle("Anbieter").navigationBarTitleDisplayMode(.inline).navigationDestination(for:Offer.self) { OfferDetail(offer:$0) }
    }
}
