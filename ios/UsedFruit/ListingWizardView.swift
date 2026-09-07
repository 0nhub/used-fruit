import SwiftUI

struct CreateOfferView: View {
    @Environment(AppStore.self) private var store
    @Environment(\.dismiss) private var dismiss
    var editing:Offer?=nil
    @State private var values: [String:String] = [:]
    @State private var index = 0
    @State private var locationQuery = ""
    @State private var complete = false
    @State private var error = ""
    @State private var publishing = false
    @State private var publishKey = UUID().uuidString
    @FocusState private var priceFocused: Bool
    private let catalog = WebCatalog.shared
    private var steps: [String] { catalog.wizardSteps(values) }
    private var step: String { steps[min(index,steps.count-1)] }
    private var ready: Bool { catalog.valid(step,values:values) }
    private func binding(_ key: String) -> Binding<String> { Binding(get:{values[key] ?? ""},set:{values[key]=$0}) }
    private var warrantyDate: Binding<Date> { Binding(get:{DateFormatter.catalog.date(from:values["warrantyUntil"] ?? "") ?? Date()},set:{values["warrantyUntil"]=DateFormatter.catalog.string(from:$0)}) }
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
            GeometryReader { geometry in
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
                    if step=="keyboard" && values["keyboard"]=="other" {TextField("Layout genauer beschreiben",text:binding("keyboardDetails")).textFieldStyle(SoftInputStyle())}
                    if step=="warranty" && values["warranty"]=="yes" {
                        DatePicker("Gültig bis",selection:warrantyDate,in:Date()...,displayedComponents:.date)
                            .onAppear{if values["warrantyUntil"]==nil{values["warrantyUntil"]=DateFormatter.catalog.string(from:Date())}}
                    }
                    entryFields
                    if !error.isEmpty {Text(error).foregroundStyle(.red)}
                    Spacer(minLength:0)
                    HStack {
                        if index>0 {Button("Zurück"){index-=1}.buttonStyle(.bordered)}
                        Spacer()
                        Button(index==steps.count-1 ? (editing == nil ? "Veröffentlichen":"Änderungen speichern"):"Weiter") {
                            priceFocused=false
                            if index<steps.count-1 {index+=1} else {Task { await publish() }}
                        }.buttonStyle(.borderedProminent).disabled(!ready || publishing)
                    }.controlSize(.large).padding(.top,12)

                }.frame(minHeight:max(0,geometry.size.height-48),alignment:.top).padding(24)
            }
            }
            .id(step)
            .toolbar(.hidden,for:.tabBar)
            .toolbar(.visible,for:.navigationBar)
            .toolbarBackground(.hidden,for:.navigationBar)
            .toolbar { ToolbarItem(placement:.topBarLeading) { Button("Schließen",systemImage:"xmark") { if editing != nil{dismiss()}else{store.save();store.tab=0} }.labelStyle(.iconOnly).accessibilityHint("Zurück zum Katalog. Dein Entwurf bleibt erhalten.") } }
            .alert("Inserat gespeichert",isPresented:$complete){Button("Zum Katalog"){store.tab=0}}message:{Text("Dein Inserat ist jetzt veröffentlicht und auf anderen Geräten sichtbar.")}
            .onAppear{if values.isEmpty{
                if let editing {
                    var initial=editing.specs ?? [:];initial["city"]=editing.city;initial["price"]=String(editing.price);initial["battery"]=initial["cycles"] ?? initial["capacity"];initial["warranty"]=initial["warrantyUntil"] == nil ? "no":"yes"
                    values=catalog.normalize((UserDefaults.standard.dictionary(forKey:"backend.editdraft."+store.identity+editing.id) as? [String:String]) ?? initial)
                }else{values=catalog.normalize(store.data.listingDraft ?? ["category":"iphone"])}
                publishKey=values["publicationKey"] ?? UUID().uuidString;values["publicationKey"]=publishKey
            }}
            .onChange(of:values){guard !values.isEmpty else{return};if let editing{UserDefaults.standard.set(values,forKey:"backend.editdraft."+store.identity+editing.id)}else{store.data.listingDraft=values;store.save()}}
        }
    }
    @ViewBuilder private var entryFields: some View {
                    if step=="battery" {
                        let cycles=catalog.model(values["model"])?.battery=="cycles"
                        if cycles {
                            TextField("Anzahl Ladezyklen",text:binding("battery")).keyboardType(.numberPad).textFieldStyle(SoftInputStyle())
                        } else {
                            Picker("Maximale Kapazität",selection:binding("battery")) {
                                ForEach(Array(stride(from:100,through:70,by:-1)),id:\.self) { value in Text(value==70 ? "70% oder weniger":"\(value)%").tag(String(value)) }
                            }.pickerStyle(.wheel).frame(height:180).accessibilityIdentifier("battery-wheel")
                            .onAppear { if values["battery"]==nil { values["battery"]="100" } }
                        }
                        Text(cycles ? "Apple-Menü → Über diesen Mac → Systembericht → Stromversorgung → Zyklenanzahl" : "Einstellungen → Batterie → Batteriezustand → Maximale Kapazität").font(.footnote).foregroundStyle(.secondary)
                    }
                    if step=="price" {HStack{TextField("0,00",text:binding("price")).keyboardType(.numberPad).focused($priceFocused).font(.largeTitle).onAppear { priceFocused=true };Text("€").font(.title)}.padding().background(Color(.secondarySystemBackground),in:.rect(cornerRadius:18))}
                    if step=="location" {
                        VStack(spacing:0) {
                            TextField("Straße und Hausnummer",text:binding("street")).textContentType(.streetAddressLine1).padding(18)
                            Divider().padding(.horizontal,18)
                            TextField("PLZ oder Stadt",text:$locationQuery).textContentType(.postalCode).padding(18)
                            if !locationQuery.isEmpty {ForEach(catalog.places.filter{$0.label.localizedCaseInsensitiveContains(locationQuery)}.prefix(8)){place in Button(place.label){values["city"]=place.city;values["postalCode"]=place.postalCode;locationQuery=""}.frame(maxWidth:.infinity,alignment:.leading).padding(14)}}
                            if let city=values["city"] {Text("\(values["postalCode"] ?? "") \(city)").frame(maxWidth:.infinity,alignment:.leading).padding(18)}
                            Divider().padding(.horizontal,18)
                            TextField("Ortsteil",text:binding("locality")).padding(18)
                        }.background(Color(.secondarySystemBackground),in:.rect(cornerRadius:22))
                        Text("Im Inserat erscheinen nur Stadt und PLZ. Den Treffpunkt vereinbarst du im Chat.").font(.footnote).foregroundStyle(.secondary)

                    }
    }
    private func publish() async {
        guard !publishing else { return }; publishing=true;defer{publishing=false}
        guard steps.allSatisfy({catalog.valid($0,values:values)}),let model=catalog.model(values["model"]),let price=Double((values["price"] ?? "").replacingOccurrences(of:",",with:".")) else{error="Bitte prüfe die Angaben in den vorherigen Schritten.";return}
        var specs=values
        if values["showExactAddress"] != "yes" { specs["street"]=nil }
        if values["battery"]=="70" { specs["capacityAtMost"]="yes" }
        specs["createdAt"]=ISO8601DateFormatter().string(from:Date())
        specs[model.battery=="cycles" ? "cycles":"capacity"]=values["battery"]
        if values["warranty"] != "yes" {specs["warrantyUntil"]=nil}
        let offer=Offer(title:model.name,category:catalog.categories.first{$0.id==model.categoryId}?.label ?? "Mac",price:price,city:values["city"] ?? "",detail:"",seller:store.data.name,specs:specs)
        guard await store.publish(offer,key:publishKey,editing:editing) else { error=store.error ?? "Veröffentlichen fehlgeschlagen. Dein Entwurf bleibt erhalten.";return }
        values=[:];index=0;if editing != nil{dismiss()}else{complete=true};publishKey=UUID().uuidString
    }
}
extension DateFormatter {
    static var catalog: DateFormatter {let f=DateFormatter();f.locale=Locale(identifier:"en_US_POSIX");f.dateFormat="yyyy-MM-dd";return f}
}

struct SoftInputStyle: TextFieldStyle {
    func _body(configuration:TextField<Self._Label>) -> some View {
        configuration.padding(.horizontal,18).padding(.vertical,16).background(Color(.tertiarySystemFill),in:.rect(cornerRadius:16))
    }
}
