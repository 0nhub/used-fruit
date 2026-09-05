import SwiftUI
import AuthenticationServices
import Security

struct Offer: Identifiable, Codable, Hashable {
    var id = UUID().uuidString
    var title: String
    var category: String
    var price: Double
    var city: String
    var detail: String
    var seller: String
    var symbol: String { category == "Mac" ? "laptopcomputer" : category == "iPad" ? "ipad" : "iphone" }
    var specs: [String:String]?
    var displayTitle: String {
        guard let s = specs, let m = WebCatalog.shared.model(s["model"]) else { return title }
        return [m.name, s["year"], s["chip"], s["storage"]].compactMap { $0 }.joined(separator: " ")
    }
    static var samples: [Offer] {
        WebCatalog.shared.listings.map { item in
            Offer(id:item.id,title:WebCatalog.shared.model(item.modelId)?.name ?? item.modelId,category:WebCatalog.shared.categories.first { $0.id == item.categoryId }?.label ?? "Mac",price:item.price,city:item.city,detail:"",seller:item.sellerName,specs:item.values)
        }
    }
}
struct ChatMessage: Identifiable, Codable { var id = UUID(); var text: String; var mine: Bool }
struct Conversation: Identifiable, Codable {
    var id: String { offer.id }
    var offer: Offer
    var messages: [ChatMessage]
}
struct LocalData: Codable {
    var name = "Alex"
    var emoji = "🍏"
    var city = ""
    var favorites: Set<String> = []
    var ownOffers: [Offer] = []
    var chats: [Conversation] = []
    var listingDraft: [String:String]?
    var bio: String?
    var emailNotifications: Bool?
    var blockedSellers: [String]?
    var demoChatsSeeded: Bool?
}

@MainActor @Observable final class AppStore {
    var signedIn = false
    var checking = true
    var demo = false
    var error: String?
    var tab = 0
    var data = LocalData()
    private var identity = ""
    var offers: [Offer] { (data.ownOffers + Offer.samples).filter { !isBlocked($0.seller) } }
    private let service = "de.usedfruit.app.apple-identity"

    init() { Task { await restore() } }
    private func restore() async {
        defer { checking = false }
        guard let id = savedIdentity() else { return }
        do {
            let state = try await ASAuthorizationAppleIDProvider().credentialState(forUserID: id)
            if state == .authorized { enter(id: id, name: nil) }
            else { clearIdentity() }
        } catch { self.error = "Bitte melde dich erneut mit Apple an." }
    }
    func handleApple(_ result: Result<ASAuthorization, Error>) {
        switch result {
        case .success(let authorization):
            guard let credential = authorization.credential as? ASAuthorizationAppleIDCredential else { return }
            let name = credential.fullName.map { PersonNameComponentsFormatter().string(from: $0) }
            guard saveIdentity(credential.user) else { error = "Die Anmeldung konnte nicht sicher gespeichert werden."; return }
            enter(id: credential.user, name: name)
        case .failure(let failure):
            if (failure as? ASAuthorizationError)?.code != .canceled { error = "Apple-Anmeldung nicht abgeschlossen. Bitte versuche es erneut." }
        }
    }
    #if DEBUG
    func enterDemo() {
        demo = true
        let testing = ProcessInfo.processInfo.arguments.contains("--ui-testing")
        if testing { UserDefaults.standard.removeObject(forKey: "account.local-ui-tests") }
        enter(id: testing ? "local-ui-tests" : "local-demo", name: "Alex")
        if data.demoChatsSeeded != true {
            var seen = Set<String>()
            let examples = Offer.samples.filter { seen.insert($0.seller).inserted }.prefix(3)
            for (index,offer) in examples.enumerated() where !data.chats.contains(where: { $0.id == offer.id }) {
                let exchanges = [
                    [ChatMessage(text:"Hallo! Ist das Gerät noch verfügbar?",mine:true),ChatMessage(text:"Hallo Alex, ja! Du kannst es gern vor Ort anschauen.",mine:false),ChatMessage(text:"Super, passt dir morgen gegen 18 Uhr?",mine:true)],
                    [ChatMessage(text:"Hallo, ist die Originalverpackung dabei?",mine:true),ChatMessage(text:"Ja, die Verpackung und das Ladekabel sind dabei. Hast du noch Fragen?",mine:false)],
                    [ChatMessage(text:"Wäre eine Abholung am Wochenende möglich?",mine:true),ChatMessage(text:"Samstag ab 11 Uhr passt mir gut.",mine:false),ChatMessage(text:"Perfekt, danke! Ich melde mich vorher noch einmal.",mine:true)]
                ]
                data.chats.append(.init(offer:offer,messages:exchanges[index]))
            }
            data.demoChatsSeeded = true; save()
        }
    }
    #endif
    private func enter(id: String, name: String?) {
        identity = id
        if let bytes = UserDefaults.standard.data(forKey: "account.\(id)"), let saved = try? JSONDecoder().decode(LocalData.self, from: bytes) { data = saved }
        else { data = LocalData(); if let name, !name.isEmpty { data.name = name } }
        tab = 0; signedIn = true
    }
    func save() {
        guard !identity.isEmpty, let bytes = try? JSONEncoder().encode(data) else { return }
        UserDefaults.standard.set(bytes, forKey: "account.\(identity)")
    }
    func toggleFavorite(_ offer: Offer) {
        if data.favorites.contains(offer.id) { data.favorites.remove(offer.id) } else { data.favorites.insert(offer.id) }
        save()
    }
    func isBlocked(_ seller: String) -> Bool { data.blockedSellers?.contains(seller) == true }
    func block(_ seller: String) { data.blockedSellers = Array(Set((data.blockedSellers ?? []) + [seller])).sorted(); save() }
    func unblock(_ seller: String) { data.blockedSellers?.removeAll { $0 == seller }; save() }
    func startChat(_ offer: Offer) {
        guard !isBlocked(offer.seller) else { return }
        if !data.chats.contains(where: { $0.id == offer.id }) { data.chats.insert(.init(offer: offer, messages: []), at: 0); save() }
    }
    func send(_ text: String, to id: String) {
        guard !text.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty, let index = data.chats.firstIndex(where: { $0.id == id }) else { return }
        guard !isBlocked(data.chats[index].offer.seller) else { return }
        data.chats[index].messages.append(.init(text: text, mine: true)); save()
    }
    func logout() { clearIdentity(); identity = ""; data = LocalData(); signedIn = false; demo = false; tab = 0 }
    private func savedIdentity() -> String? {
        let query: [String: Any] = [kSecClass as String: kSecClassGenericPassword, kSecAttrService as String: service, kSecReturnData as String: true, kSecMatchLimit as String: kSecMatchLimitOne]
        var result: CFTypeRef?
        guard SecItemCopyMatching(query as CFDictionary, &result) == errSecSuccess, let bytes = result as? Data else { return nil }
        return String(data: bytes, encoding: .utf8)
    }
    private func saveIdentity(_ id: String) -> Bool {
        clearIdentity()
        return SecItemAdd([kSecClass as String: kSecClassGenericPassword, kSecAttrService as String: service, kSecValueData as String: Data(id.utf8), kSecAttrAccessible as String: kSecAttrAccessibleWhenUnlockedThisDeviceOnly] as CFDictionary, nil) == errSecSuccess
    }
    private func clearIdentity() { SecItemDelete([kSecClass as String: kSecClassGenericPassword, kSecAttrService as String: service] as CFDictionary) }
}
