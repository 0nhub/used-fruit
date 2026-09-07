import Foundation
import Security
import CryptoKit

struct NativeAPIError: LocalizedError { let message: String; var errorDescription: String? { message } }
struct SessionTokens: Codable { var accessToken: String; var refreshToken: String; var expiresIn: Int }
@MainActor final class NativeAPI {
    static let shared = NativeAPI()
    // Production is enabled only after the shared acceptance checklist is signed off.
    let origin = URL(string: "https://staging.usedfruit.de")!
    private let service = "de.usedfruit.app.backend.staging.tokens"
    private var tokens: SessionTokens?
    private var rotating: Task<Void, Error>?
    init() {
        var value: CFTypeRef?
        let query: [String:Any] = [kSecClass as String:kSecClassGenericPassword,kSecAttrService as String:service,kSecReturnData as String:true,kSecMatchLimit as String:kSecMatchLimitOne]
        if SecItemCopyMatching(query as CFDictionary,&value) == errSecSuccess, let data=value as? Data { tokens=try? JSONDecoder().decode(SessionTokens.self,from:data) }
    }
    #if DEBUG
    var screenshotMode = false
    #endif
    var hasSession: Bool { tokens != nil }
    func storeTokens(_ value: [String:Any]) throws {
        let saved=try JSONDecoder().decode(SessionTokens.self,from:JSONSerialization.data(withJSONObject:value))
        let bytes=try JSONEncoder().encode(saved)
        let query:[String:Any]=[kSecClass as String:kSecClassGenericPassword,kSecAttrService as String:service]
        let attributes:[String:Any]=[kSecValueData as String:bytes,kSecAttrAccessible as String:kSecAttrAccessibleAfterFirstUnlockThisDeviceOnly]
        let result=SecItemUpdate(query as CFDictionary,attributes as CFDictionary)
        if result == errSecItemNotFound {
            guard SecItemAdd(query.merging(attributes){_,new in new} as CFDictionary,nil) == errSecSuccess else { throw NativeAPIError(message:"Die Sitzung konnte nicht sicher gespeichert werden.") }
        } else if result != errSecSuccess { throw NativeAPIError(message:"Die Sitzung konnte nicht sicher gespeichert werden.") }
        tokens=saved
    }
    func clear() { tokens=nil;SecItemDelete([kSecClass as String:kSecClassGenericPassword,kSecAttrService as String:service] as CFDictionary) }
    func request(_ path:String,method:String="GET",body:[String:Any]?=nil,key:String?=nil,authenticated:Bool=true,retry:Bool=true,uploadData:Data?=nil,mediaType:String?=nil) async throws -> [String:Any] {
        #if DEBUG
        guard !screenshotMode else { throw NativeAPIError(message:"Im lokalen Testkonto werden keine Serveraktionen ausgeführt.") }
        #endif
        var request=URLRequest(url:URL(string:"/api/v1"+path,relativeTo:origin)!)
        request.httpMethod=method;request.timeoutInterval=20;request.cachePolicy = .reloadIgnoringLocalCacheData
        if authenticated,let tokens { request.setValue("Bearer "+tokens.accessToken,forHTTPHeaderField:"Authorization") }
        if let body {request.httpBody=try JSONSerialization.data(withJSONObject:body);request.setValue("application/json",forHTTPHeaderField:"Content-Type")}
        if let uploadData {request.httpBody=uploadData;request.setValue(mediaType ?? "image/jpeg",forHTTPHeaderField:"Content-Type")}
        if let key {request.setValue(key,forHTTPHeaderField:"Idempotency-Key")}
        let (data,response)=try await URLSession.shared.data(for:request)
        guard let http=response as? HTTPURLResponse else {throw NativeAPIError(message:"Keine Verbindung zum Server.")}
        if http.statusCode == 401 && authenticated && retry && tokens != nil {
            try await rotate();return try await self.request(path,method:method,body:body,key:key,authenticated:authenticated,retry:false,uploadData:uploadData,mediaType:mediaType)
        }
        let result=(try? JSONSerialization.jsonObject(with:data)) as? [String:Any] ?? [:]
        guard (200...299).contains(http.statusCode) else {
            if http.statusCode == 401 && authenticated { clear() }
            throw NativeAPIError(message:(result["error"] as? [String:Any])?["message"] as? String ?? "Die Anfrage konnte nicht abgeschlossen werden.")
        }
        return result
    }
    private func rotate() async throws {
        if let rotating {try await rotating.value;return}
        let task=Task<Void,Error> { @MainActor in
            guard let current=tokens else {throw NativeAPIError(message:"Bitte melde dich erneut an.")}
            let result=try await request("/auth/refresh",method:"POST",body:["refreshToken":current.refreshToken],authenticated:false,retry:false)
            try storeTokens(result)
        }
        rotating=task
        defer{rotating=nil}
        do{try await task.value}catch{clear();throw error}
    }
    func postDurably(_ path:String,body:[String:Any],account:String) async throws -> [String:Any] {
        let bytes=try JSONSerialization.data(withJSONObject:body,options:.sortedKeys)
        let hash=SHA256.hash(data:bytes).map{String(format:"%02x",$0)}.joined()
        let storageKey="backend.pending."+account+path+hash
        let key=UserDefaults.standard.string(forKey:storageKey) ?? UUID().uuidString
        UserDefaults.standard.set(key,forKey:storageKey)
        let result=try await request(path,method:"POST",body:body,key:key)
        UserDefaults.standard.removeObject(forKey:storageKey);return result
    }
    func pages(_ path:String) async throws -> [[String:Any]] {
        var values:[[String:Any]]=[],cursor:String?
        repeat {
            let result=try await request(path+(cursor.map{"?cursor="+$0.addingPercentEncoding(withAllowedCharacters:.urlQueryAllowed)!} ?? ""))
            values += result["items"] as? [[String:Any]] ?? [];cursor=result["nextCursor"] as? String
        } while cursor != nil
        return values
    }
}
