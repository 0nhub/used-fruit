import Foundation

struct CatalogChoice: Codable, Identifiable { var id: String; var label: String; var hex: String?; var hint: String?; var shortLabel: String?; var compactLabel: String { shortLabel ?? label } }
struct CatalogVariant: Codable {
    var year: Int?; var chips: [String]?; var sizes: [String]?; var colors: [CatalogChoice]; var memory: [String]?; var storage: [String]?
}
struct CatalogModel: Codable, Identifiable {
    var id: String; var categoryId: String; var name: String; var sizes: [String]?; var years: [Int]?; var colors: [CatalogChoice]
    var memoryOptions: [String]?; var storageOptions: [String]?; var chips: [String]; var battery: String?; var keyboard: Bool
    var variants: [CatalogVariant]; var chipYears: [String: [Int]]
    func options(_ year: String?) -> CatalogVariant { variants.first { String($0.year ?? 0) == year } ?? CatalogVariant(chips: chips, sizes: sizes, colors: colors, memory: memoryOptions, storage: storageOptions) }
}
struct CatalogPlace: Codable, Identifiable, Hashable {
    var postalCode: String; var city: String; var state: String; var lat: Double; var lng: Double
    var id: String { postalCode + city }; var label: String { "\(postalCode) \(city)" }
    func distance(to other: CatalogPlace) -> Double {
        let p = Double.pi / 180, dLat = (other.lat-lat)*p, dLon = (other.lng-lng)*p
        let a = pow(sin(dLat/2),2)+cos(lat*p)*cos(other.lat*p)*pow(sin(dLon/2),2)
        return 6371 * 2 * atan2(sqrt(a),sqrt(max(0,1-a)))
    }
}
struct StepCopy: Codable { var title: String; var subtitle: String; var tip: String? }
struct WebListing: Codable {
    var id: String; var modelId: String; var categoryId: String; var price: Double; var city: String; var postalCode: String; var sellerName: String
    var chip: String?; var colorId: String; var size: String?; var year: Int?; var memory: String?; var storage: String?; var condition: String
    var originalBox: Bool?; var shippingScope: String; var createdAt: String; var connectivity: String?; var simLock: String?; var keyboardLayout: String?
    var appleWarrantyUntil: String?; var batteryMaxCapacityPercent: Int?; var batteryCycleCount: Int?
    var values: [String:String] {
        var s = ["model":modelId,"category":categoryId,"color":colorId,"condition":condition,"shipping":shippingScope,"postalCode":postalCode,"city":city,"createdAt":createdAt]
        s["chip"]=chip;s["size"]=size;s["year"]=year.map(String.init);s["memory"]=memory;s["storage"]=storage;s["connectivity"]=connectivity;s["simLock"]=simLock;s["keyboard"]=keyboardLayout
        s["packaging"]=originalBox.map { $0 ? "yes":"no" };s["warrantyUntil"]=appleWarrantyUntil;s["capacity"]=batteryMaxCapacityPercent.map(String.init);s["cycles"]=batteryCycleCount.map(String.init)
        return s
    }
}
struct WizardFixture: Codable { var modelId: String; var chip: String?; var year: Int?; var connectivity: String?; var steps: [String] }
struct HardwareRow: Codable, Hashable { var label: String; var value: String }
struct SellerReputation: Codable {
    struct Rank: Codable { var label: String; var blurb: String }
    struct Medal: Codable, Identifiable { var id: String; var label: String; var how: String; var earned: Bool }
    var rank: Rank; var ratingCount: Int; var percentPositive: Int?; var medals: [Medal]
}
struct CatalogSeller: Codable { var name: String; var emoji: String; var bio: String; var joinedAt: String; var reputation: SellerReputation }
struct WebCatalog: Codable {
    var hardware: [String:[HardwareRow]]?
    var sellers: [String:CatalogSeller]?

    var models: [CatalogModel]; var categories: [CatalogChoice]; var conditions: [CatalogChoice]; var keyboard: [CatalogChoice]
    var radius: [Int]; var capacity: [Int]; var cycles: [Int]; var steps: [String:StepCopy]; var places: [CatalogPlace]; var listings: [WebListing]; var fixtures: [WizardFixture]
    static let shared: WebCatalog = {
        guard let url = Bundle.main.url(forResource: "WebCatalog", withExtension: "json"), let data = try? Data(contentsOf: url), let value = try? JSONDecoder().decode(WebCatalog.self, from: data) else { fatalError("WebCatalog.json missing or incompatible. Run the catalog exporter.") }
        return value
    }()
    func model(_ id: String?) -> CatalogModel? { models.first { $0.id == id } }
    func place(postal: String?, city: String?) -> CatalogPlace? { places.first { $0.postalCode == postal } ?? places.first { $0.city == city } }
    func years(_ model: CatalogModel, chip: String?) -> [Int] { chip.flatMap { model.chipYears[$0] } ?? model.years ?? [] }
    func wizardSteps(_ values: [String:String]) -> [String] {
        let m = model(values["model"]), chips = m?.chips ?? []
        let chip = values["chip"] ?? (chips.count == 1 ? chips.first : nil)
        let years = m.map { self.years($0, chip: chip) } ?? []
        let year = values["year"] ?? (years.count == 1 ? years.first.map(String.init) : nil)
        let options = m.flatMap { year != nil || ($0.years ?? []).isEmpty ? $0.options(year) : nil }
        var result = ["category","model"]
        if chips.count > 1 { result.append("chip") }
        if chip != nil && years.count > 1 { result.append("year") }
        for (key, count) in [("color",options?.colors.count ?? 0),("size",options?.sizes?.count ?? 0),("memory",options?.memory?.count ?? 0),("storage",options?.storage?.count ?? 0)] { if count > 1 { result.append(key) } }
        if m?.categoryId == "ipad" { result.append("connectivity") }
        if m?.categoryId == "iphone" || (m?.categoryId == "ipad" && values["connectivity"] == "cellular") { result.append("simLock") }
        if m?.keyboard == true { result.append("keyboard") }
        result += ["condition","packaging","warranty"]
        if m?.battery != nil { result.append("battery") }
        return result + ["price","location","shipping"]
    }
    func choices(_ step: String, values: [String:String]) -> [CatalogChoice] {
        let m = model(values["model"]), options = m?.options(values["year"])
        func labels(_ strings: [String]) -> [CatalogChoice] { strings.map { .init(id:$0,label:$0) } }
        switch step {
        case "category": return ["iphone","ipad","mac"].compactMap { id in categories.first { $0.id == id } }
        case "model": return models.filter { $0.categoryId == values["category"] }.map { .init(id:$0.id,label:$0.name) }
        case "chip": return labels(m?.chips ?? [])
        case "year": return labels(m.map { years($0,chip:values["chip"]).map(String.init) } ?? [])
        case "color": return options?.colors ?? []
        case "size": return labels(options?.sizes ?? [])
        case "memory": return labels(options?.memory ?? [])
        case "storage": return labels(options?.storage ?? [])
        case "connectivity": return [.init(id:"wifi",label:"WLAN"),.init(id:"cellular",label:"WLAN + Cellular")]
        case "simLock": return [.init(id:"unlocked",label:"Kein SIM-Lock"),.init(id:"locked",label:"Mit SIM-Lock")]
        case "keyboard": return keyboard
        case "condition": return conditions
        case "packaging": return [.init(id:"yes",label:"Ja"),.init(id:"no",label:"Nein")]
        case "warranty": return [.init(id:"no",label:"Keine gültige Garantie"),.init(id:"yes",label:"Garantie / AppleCare+")]
        case "shipping": return [.init(id:"local",label:"Nur Abholung"),.init(id:"deutschland",label:"Versand innerhalb Deutschlands")]
        default: return []
        }
    }
    func normalize(_ input: [String:String]) -> [String:String] {
        var v = input
        for key in ["model","chip","year","color","size","memory","storage","connectivity","simLock","keyboard","condition","packaging","warranty","shipping"] {
            let items = choices(key, values:v)
            if !items.contains(where: { $0.id == v[key] }) { v[key] = items.first?.id }
        }
        if model(v["model"])?.categoryId != "ipad" { v["connectivity"] = nil }
        if !wizardSteps(v).contains("simLock") { v["simLock"] = nil }
        if model(v["model"])?.keyboard != true { v["keyboard"] = nil; v["keyboardDetails"] = nil }
        return v
    }
    func valid(_ step: String, values v: [String:String]) -> Bool {
        let raw = (v[step] ?? "").trimmingCharacters(in:.whitespacesAndNewlines)
        switch step {
        case "keyboard": return keyboard.contains { $0.id == raw } && (raw != "other" || (1...100).contains((v["keyboardDetails"] ?? "").trimmingCharacters(in:.whitespacesAndNewlines).count))
        case "warranty": return raw == "no" || (raw == "yes" && !(v["warrantyUntil"] ?? "").isEmpty)
        case "battery":
            guard let n = Double(raw.replacingOccurrences(of:",",with:".")), n.isFinite else { return false }
            return model(v["model"])?.battery == "capacity" ? n >= 1 && n <= 100 : n >= 0 && n.rounded() == n
        case "price": guard let n = Double(raw.replacingOccurrences(of:",",with:".")) else { return false }; return n.isFinite && n > 0
        case "location": return !(v["city"] ?? "").isEmpty && !(v["postalCode"] ?? "").isEmpty && !(v["locality"] ?? "").trimmingCharacters(in:.whitespacesAndNewlines).isEmpty
        default: return choices(step,values:v).contains { $0.id == raw }
        }
    }
}
