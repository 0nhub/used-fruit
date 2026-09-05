import SwiftUI

struct CatalogFilterState {
    var category = ""
    var model = ""
    var selected: [String:Set<String>] = [:]
    var minimum = "", maximum = ""
    var place: CatalogPlace?
    var radius = 0
    var packaging = false, warranty = false, shipping = false
    var capacity = 0, cycles = 0
    var sort = "newest"
    var activeCount: Int { selected.values.reduce(0) { $0 + $1.count } + [!model.isEmpty,!minimum.isEmpty,!maximum.isEmpty,radius>0,packaging,warranty,shipping,capacity>0,cycles>0].filter{$0}.count }
    mutating func changeCategory(_ id: String) { category=id; model=""; selected=[:];capacity=0;cycles=0 }
    func results(_ offers: [Offer], query: String, catalog: WebCatalog = .shared) -> [Offer] {
        let found = offers.filter { offer in
            let s = offer.specs ?? [:]
            if !category.isEmpty && s["category"] != category { return false }
            if !model.isEmpty && s["model"] != model { return false }
            if !query.isEmpty && !"\(offer.displayTitle) \(offer.city)".localizedCaseInsensitiveContains(query) { return false }
            if let n=Double(minimum.replacingOccurrences(of:",",with:".")),offer.price<n {return false}
            if let n=Double(maximum.replacingOccurrences(of:",",with:".")),offer.price>n {return false}
            for (key,values) in selected where !values.isEmpty { if !values.contains(s[key] ?? "") {return false} }
            if packaging && s["packaging"] != "yes" {return false}
            if shipping && s["shipping"] != "deutschland" {return false}
            if warranty && (s["warrantyUntil"] ?? "") < String(ISO8601DateFormatter().string(from:Date()).prefix(10)) {return false}
            let capacityMatch = capacity>0 && (Int(s["capacity"] ?? "") ?? -1)>=capacity
            let cycleMatch = cycles>0 && (Int(s["cycles"] ?? "") ?? Int.max)<=cycles
            if capacity>0 && cycles>0 {if !capacityMatch && !cycleMatch{return false}}
            else if capacity>0 && !capacityMatch{return false}
            else if cycles>0 && !cycleMatch{return false}
            if radius>0,let place {guard let other=catalog.place(postal:s["postalCode"],city:offer.city),place.distance(to:other)<=Double(radius) else{return false}}
            return true
        }
        return found.sorted { a,b in
            if sort=="price-asc" {return a.price<b.price}
            if sort=="nearest",let place {
                let da=catalog.place(postal:a.specs?["postalCode"],city:a.city).map{place.distance(to:$0)} ?? .infinity
                let db=catalog.place(postal:b.specs?["postalCode"],city:b.city).map{place.distance(to:$0)} ?? .infinity
                return da<db
            }
            return (a.specs?["createdAt"] ?? "") > (b.specs?["createdAt"] ?? "")
        }
    }
}
struct FilterSelection: View {
    let title: String
    let items: [CatalogChoice]
    @Binding var selected: Set<String>
    var body: some View {
        DisclosureGroup(title) {
            ForEach(items) { item in
                Button {if selected.contains(item.id){selected.remove(item.id)}else{selected.insert(item.id)}} label: {
                    HStack {Text(item.compactLabel).lineLimit(1).minimumScaleFactor(0.75).accessibilityLabel(item.label).foregroundStyle(.primary);Spacer();if selected.contains(item.id){Image(systemName:"checkmark").foregroundStyle(.blue)}}
                }
            }
        }
    }
}
struct CatalogFilterSheet: View {
    @Binding var filters: CatalogFilterState
    let count: Int
    @Environment(\.dismiss) private var dismiss
    @State private var locationQuery=""
    private let catalog=WebCatalog.shared
    private var models:[CatalogModel]{catalog.models.filter{filters.category.isEmpty || $0.categoryId==filters.category}}
    private var scoped:[CatalogModel]{filters.model.isEmpty ? models : models.filter{$0.id==filters.model}}
    private func binding(_ key:String)->Binding<Set<String>>{Binding(get:{filters.selected[key] ?? []},set:{filters.selected[key]=$0})}
    private func choices(_ strings:[String])->[CatalogChoice]{Array(Set(strings)).sorted().map{.init(id:$0,label:$0)}}
    var body: some View {
        NavigationStack {
            Form {
                Section {
                    DisclosureGroup("Standort") {
                        TextField("PLZ oder Ort",text:$locationQuery)
                        if !locationQuery.isEmpty {ForEach(catalog.places.filter{$0.label.localizedCaseInsensitiveContains(locationQuery)}.prefix(8)){place in Button(place.label){filters.place=place;locationQuery=""}}}
                        if let place=filters.place {HStack{Text(place.label);Spacer();Button("Entfernen"){filters.place=nil;filters.radius=0;if filters.sort=="nearest"{filters.sort="newest"}}}}
                        Picker("Umkreis",selection:$filters.radius){Text("Keine Begrenzung").tag(0);ForEach(catalog.radius,id:\.self){Text("\($0) km").tag($0)}}.disabled(filters.place==nil)
                    }
                    DisclosureGroup("Preis") {TextField("Von (€)",text:$filters.minimum).keyboardType(.decimalPad);TextField("Bis (€)",text:$filters.maximum).keyboardType(.decimalPad)}
                    DisclosureGroup("Modelle") {
                        Picker("Modell",selection:$filters.model){Text("Alle Modelle").tag("");ForEach(models){Text($0.name).tag($0.id)}}
                            .onChange(of:filters.model){filters.selected=[:];filters.capacity=0;filters.cycles=0;if let m=catalog.model(filters.model){filters.category=m.categoryId}}
                    }
                    if !filters.category.isEmpty {
                        if !scoped.flatMap({$0.sizes ?? []}).isEmpty {FilterSelection(title:"Größen",items:choices(scoped.flatMap{$0.sizes ?? []}),selected:binding("size"))}
                        FilterSelection(title:"Veröffentlicht",items:choices(scoped.flatMap{($0.years ?? []).map(String.init)}),selected:binding("year"))
                        FilterSelection(title:"Farbe",items:scoped.flatMap{$0.colors}.reduce(into:[CatalogChoice]()){ result,item in if !result.contains(where: {$0.id==item.id}){result.append(item)}},selected:binding("color"))
                        if !scoped.flatMap({$0.memoryOptions ?? []}).isEmpty {FilterSelection(title:"Arbeitsspeicher",items:choices(scoped.flatMap{$0.memoryOptions ?? []}),selected:binding("memory"))}
                        FilterSelection(title:"Kapazität",items:choices(scoped.flatMap{$0.storageOptions ?? []}),selected:binding("storage"))
                    }
                    if (filters.category.isEmpty || filters.category=="mac") && (filters.model.isEmpty || catalog.model(filters.model)?.keyboard == true) {FilterSelection(title:"Tastaturlayout",items:catalog.keyboard,selected:binding("keyboard"))}
                    FilterSelection(title:"Zustand",items:catalog.conditions,selected:binding("condition"))
                    DisclosureGroup("Originalverpackung"){Toggle("Nur mit Originalverpackung",isOn:$filters.packaging)}
                    DisclosureGroup("Garantie"){Toggle("Nur mit gültiger Garantie",isOn:$filters.warranty)}
                    if scoped.contains(where:{$0.battery != nil}) {
                        DisclosureGroup("Batterie") {
                            if scoped.contains(where:{$0.battery=="capacity"}){Picker("Kapazität",selection:$filters.capacity){Text("Alle").tag(0);ForEach(catalog.capacity,id:\.self){Text("Mind. \($0) %").tag($0)}}}
                            if scoped.contains(where:{$0.battery=="cycles"}){Picker("Ladezyklen",selection:$filters.cycles){Text("Alle").tag(0);ForEach(catalog.cycles,id:\.self){Text("Max. \($0) Zyklen").tag($0)}}}
                        }
                    }
                    DisclosureGroup("Versand"){Toggle("Versand möglich",isOn:$filters.shipping)}
                }
                Button("Alle Filter zurücksetzen"){filters=CatalogFilterState()}
            }.navigationTitle("Filter").navigationBarTitleDisplayMode(.inline)
                .toolbar{ToolbarItem(placement:.topBarLeading){Button("Schließen",systemImage:"xmark"){dismiss()}}}
                .safeAreaInset(edge:.bottom){Button("\(count) Angebote anzeigen"){dismiss()}.buttonStyle(.glassProminent).controlSize(.large).frame(maxWidth:.infinity).padding().background(.ultraThinMaterial)}
        }
    }
}
