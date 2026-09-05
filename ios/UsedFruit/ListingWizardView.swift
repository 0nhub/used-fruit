import SwiftUI

struct CreateOfferView: View {
    @Environment(AppStore.self) private var store
    @State private var values: [String:String] = [:]
    @State private var index = 0
    @State private var locationQuery = ""
    @State private var complete = false
    @State private var error = ""
    private let catalog = WebCatalog.shared
    private var steps: [String] { catalog.wizardSteps(values) }
    private var step: String { steps[min(index,steps.count-1)] }
    private var ready: Bool { catalog.valid(step,values:values) }
    private func binding(_ key: String) -> Binding<String> { Binding(get:{values[key] ?? ""},set:{values[key]=$0}) }
    private func choose(_ id: String) {
        values[step]=id
        if ["category","model","chip","year"].contains(step) {
            let fields=["category","model","chip","year","color","size","memory","storage","connectivity","simLock","keyboard","battery"]
            if let at=fields.firstIndex(of:step){for field in fields.dropFirst(at+1){values[field]=nil}}
        }
        values=catalog.normalize(values)
    }
    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(alignment:.leading,spacing:24) {
                    VStack(alignment:.leading,spacing:10) {
                        Text(catalog.steps[step]?.title ?? step).font(.largeTitle.bold())
                        Text(catalog.steps[step]?.subtitle ?? "").font(.title3).foregroundStyle(.secondary)
                        if let tip=catalog.steps[step]?.tip {Label(tip,systemImage:"info.circle").font(.footnote).foregroundStyle(.secondary)}
                    }
                    ForEach(catalog.choices(step,values:values)) {choice in
                        Button {choose(choice.id)} label: {
                            HStack(spacing:14) {
                                if let hex=choice.hex {Circle().fill(Color(catalogHex:hex)).frame(width:26,height:26).overlay(Circle().stroke(.gray.opacity(0.2)))}
                                VStack(alignment:.leading,spacing:5){Text(choice.label).font(.headline);if let hint=choice.hint{Text(hint).font(.footnote).foregroundStyle(.secondary)}}
                                Spacer();Image(systemName:values[step]==choice.id ? "checkmark.circle.fill":"circle").foregroundStyle(values[step]==choice.id ? .blue:.secondary)
                            }.padding(18).frame(maxWidth:.infinity,alignment:.leading).background(Color(.secondarySystemBackground),in:.rect(cornerRadius:18))
                        }.buttonStyle(.plain)
                    }
                    if step=="keyboard" && values["keyboard"]=="other" {TextField("Layout genauer beschreiben",text:binding("keyboardDetails")).textFieldStyle(.roundedBorder)}
                    if step=="warranty" && values["warranty"]=="yes" {
                        DatePicker("Gültig bis",selection:Binding(get:{DateFormatter.catalog.date(from:values["warrantyUntil"] ?? "") ?? Date()},set:{values["warrantyUntil"]=DateFormatter.catalog.string(from:$0)}),in:Date()...,displayedComponents:.date)
                            .onAppear{if values["warrantyUntil"]==nil{values["warrantyUntil"]=DateFormatter.catalog.string(from:Date())}}
                    }
                    if step=="battery" {
                        let cycles=catalog.model(values["model"])?.battery=="cycles"
                        TextField(cycles ? "Anzahl Ladezyklen":"Maximale Kapazität (%)",text:binding("battery")).keyboardType(cycles ? .numberPad:.decimalPad).textFieldStyle(.roundedBorder)
                        Text(cycles ? "Apple-Menü → Über diesen Mac → Systembericht → Stromversorgung → Zyklenanzahl" : "Einstellungen → Batterie → Batteriezustand → Maximale Kapazität").font(.footnote).foregroundStyle(.secondary)
                    }
                    if step=="price" {HStack{TextField("0,00",text:binding("price")).keyboardType(.decimalPad).font(.largeTitle);Text("€").font(.title)}.padding().background(Color(.secondarySystemBackground),in:.rect(cornerRadius:18))}
                    if step=="location" {
                        TextField("PLZ oder Stadt",text:$locationQuery).textFieldStyle(.roundedBorder)
                        if !locationQuery.isEmpty {ForEach(catalog.places.filter{$0.label.localizedCaseInsensitiveContains(locationQuery)}.prefix(8)){place in Button(place.label){values["city"]=place.city;values["postalCode"]=place.postalCode;locationQuery=""}}}
                        if let city=values["city"] {Label("\(values["postalCode"] ?? "") \(city)",systemImage:"mappin.and.ellipse")}
                        TextField("Ortsteil",text:binding("locality")).textFieldStyle(.roundedBorder)
                        TextField("Straße und Hausnummer (optional)",text:binding("street")).textFieldStyle(.roundedBorder)
                    }
                    if !error.isEmpty {Text(error).foregroundStyle(.red)}
                    HStack {
                        if index>0 {Button("Zurück"){index-=1}.buttonStyle(.bordered)}
                        Spacer()
                        Button(index==steps.count-1 ? "Demo-Inserat speichern":"Weiter") {
                            if index<steps.count-1 {index+=1} else {publish()}
                        }.buttonStyle(.borderedProminent).disabled(!ready)
                    }.controlSize(.large).padding(.top,12)

                }.padding(24)
            }
            .id(step)
            .toolbar(.hidden, for:.navigationBar)
            .alert("Inserat gespeichert",isPresented:$complete){Button("Zum Katalog"){store.tab=0}}message:{Text("Dein Inserat ist in der lokalen App sichtbar. Es wird noch nicht auf usedfruit.de veröffentlicht.")}
            .onAppear{if values.isEmpty{values=catalog.normalize(store.data.listingDraft ?? ["category":"iphone"])}}
            .onChange(of:values){store.data.listingDraft=values;store.save()}
        }
    }
    private func publish() {
        guard steps.allSatisfy({catalog.valid($0,values:values)}),let model=catalog.model(values["model"]),let price=Double((values["price"] ?? "").replacingOccurrences(of:",",with:".")) else{error="Bitte prüfe die Angaben in den vorherigen Schritten.";return}
        var specs=values
        specs["createdAt"]=ISO8601DateFormatter().string(from:Date())
        specs[model.battery=="cycles" ? "cycles":"capacity"]=values["battery"]
        if values["warranty"] != "yes" {specs["warrantyUntil"]=nil}
        let offer=Offer(title:model.name,category:catalog.categories.first{$0.id==model.categoryId}?.label ?? "Mac",price:price,city:values["city"] ?? "",detail:"",seller:store.data.name,specs:specs)
        store.data.ownOffers.insert(offer,at:0);store.data.listingDraft=nil;store.save()
        values=[:];index=0;complete=true
    }
}
extension DateFormatter {
    static var catalog: DateFormatter {let f=DateFormatter();f.locale=Locale(identifier:"en_US_POSIX");f.dateFormat="yyyy-MM-dd";return f}
}
