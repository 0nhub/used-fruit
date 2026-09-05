import SwiftUI

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
    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 24) {
                DeviceArtwork(offer: offer)
                HStack(alignment: .top) {
                    VStack(alignment: .leading, spacing: 8) { Text(offer.displayTitle).font(.largeTitle.bold()); Text(offer.price, format: .currency(code: "EUR")).font(.title.bold()) }
                    Spacer()
                    Button { store.toggleFavorite(offer) } label: { Image(systemName: store.data.favorites.contains(offer.id) ? "heart.fill" : "heart").foregroundStyle(.red) }.buttonStyle(.glass).accessibilityLabel("Favorit umschalten")
                }
                Label(offer.city, systemImage: "mappin.and.ellipse").foregroundStyle(.secondary)
                Text(offer.detail).lineSpacing(6)
                if let specs=offer.specs {
                    VStack(spacing:12){ForEach(["size","memory","storage","connectivity","simLock","keyboard","condition","packaging","warrantyUntil","capacity","cycles","shipping"],id:\.self){key in
                        if let value=specs[key] {HStack(alignment:.top){Text(WebCatalog.shared.steps[key]?.title ?? ["warrantyUntil":"Garantie bis","capacity":"Batteriekapazität (%)","cycles":"Ladezyklen"][key] ?? key).foregroundStyle(.secondary);Spacer();Text(WebCatalog.shared.choices(key,values:specs).first{$0.id==value}?.label ?? value).multilineTextAlignment(.trailing)}}}}
                }
                HStack(spacing: 16) {
                    Text("🍏").font(.largeTitle).padding(10).background(.background, in: Circle())
                    VStack(alignment: .leading) { Text(offer.seller).font(.headline); Text("Privater Anbieter").font(.subheadline).foregroundStyle(.secondary) }
                    Spacer()
                }.padding().background(Color(.secondarySystemBackground), in: .rect(cornerRadius: 22))
                Text("Lokaler Prototyp: Anfragen werden nur auf diesem Gerät gespeichert und nicht versendet.").font(.footnote).foregroundStyle(.secondary)
            }.padding()
        }
        .navigationTitle("Inserat").navigationBarTitleDisplayMode(.inline)
        .safeAreaInset(edge: .bottom) {
            Button { store.startChat(offer); showChat = true } label: { Label("Nachricht schreiben", systemImage: "bubble.left").frame(maxWidth: .infinity).padding(.vertical, 8) }
                .buttonStyle(.glassProminent).padding().background(.ultraThinMaterial)
        }
        .navigationDestination(isPresented: $showChat) { ConversationView(id: offer.id) }
    }
}
