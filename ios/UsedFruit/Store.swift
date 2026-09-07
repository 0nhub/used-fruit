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
    var sellerId: String = ""
    var number: String?
    var version: Int?
    var status: String = "public"
    @MainActor var displayTitle: String {
        guard let s = specs, let m = WebCatalog.shared.model(s["model"]) else { return title }
        return [m.name, s["year"], s["chip"], s["storage"]].compactMap { $0 }.joined(separator: " ")
    }
    @MainActor static var samples: [Offer] {
        WebCatalog.shared.listings.map { item in
            Offer(id:item.id,title:WebCatalog.shared.model(item.modelId)?.name ?? item.modelId,category:WebCatalog.shared.categories.first { $0.id == item.categoryId }?.label ?? "Mac",price:item.price,city:item.city,detail:"",seller:item.sellerName,specs:item.values)
        }
    }
}
struct ChatMessage: Identifiable, Codable { var id = UUID(); var text: String; var mine: Bool; var sentAt: Date? = Date(); var sequence: String? }
struct PurchaseOffer: Codable, Identifiable {
    var id: String
    var senderId: String
    var priceCents: Int
    var status: String
    var resolvedAt: String?
}
struct Conversation: Identifiable, Codable {
    var backendId: String?
    var id: String { backendId ?? offer.id }
    var offer: Offer
    var messages: [ChatMessage]
    var purchaseOffers: [PurchaseOffer] = []
    var archived = false
    var muted = false
    var updatedAt: String?
}
struct LocalData: Codable {
    var name = ""
    var emoji = "🍏"
    var city = ""
    var postalCode: String?
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
    var signedIn=false
    var checking=true
    var demo=false
    var error:String?
    var tab=0
    var data=LocalData()
    var identity=""
    var publicOffers:[Offer]=[]
    var offers:[Offer] { (data.ownOffers + publicOffers.filter { item in !data.ownOffers.contains{$0.id==item.id} }).filter { $0.status == "public" && !isBlocked($0.sellerId) } }
    var challengeId:String?
    var nonceHash:String?
    var onboarding=false
    var activeConversation:String?
    @ObservationIgnored private var visibleMessageSequences:[String:Set<String>]=[:]
    var pendingConversation:String?
    var profiles:[String:CatalogSeller]=[:]
    var blockedNames:[String:String]=[:]
    var notes:[String:String]=[:]
    var coverMediaId:String?
    private let api=NativeAPI.shared
    private var polling:Task<Void,Never>?
    private var saving:Task<Void,Never>?
    private var lastProfile:Data?
    private var refreshing=false
    init(){
        #if DEBUG
        if ProcessInfo.processInfo.arguments.contains("--screenshots") { startDemo(); return }
        #endif
        Task{await refreshCatalog();await restore()}
    }
    #if DEBUG
    func startDemo() {
        polling?.cancel();saving?.cancel();api.screenshotMode=true
        demo=true;checking=false;error=nil;onboarding=false;identity="local-screenshot-account"
        data=LocalData();data.name="Alex M.";data.emoji="🍏";data.emailNotifications=true
        // Always use bundled fixtures, never another account's cached data.
        if let url=Bundle.main.url(forResource:"WebCatalog",withExtension:"json"),let bytes=try? Data(contentsOf:url),let catalog=try? JSONDecoder().decode(WebCatalog.self,from:bytes) { WebCatalog.shared=catalog }
        publicOffers=Offer.samples.map { item in var item=item;item.sellerId=item.seller;return item }
        profiles=WebCatalog.shared.sellers ?? [:]
        data.favorites=Set(publicOffers.prefix(3).map(\.id))
        data.chats=publicOffers.prefix(3).enumerated().map { index,item in
            Conversation(offer:item,messages:[
                ChatMessage(text:"Hallo, ist das Gerät noch verfügbar?",mine:true,sentAt:Date().addingTimeInterval(-Double(index+1)*3600)),
                ChatMessage(text:["Ja, es ist noch da. Du kannst es gerne anschauen.","Abholung morgen würde gut passen.","Die Originalverpackung ist auch dabei."][index],mine:false,sentAt:Date().addingTimeInterval(-Double(index+1)*300))])
        }
        signedIn=true;tab=0
    }
    #endif
    private func refreshCatalog() async {
        do {let result=try await api.request("/catalog",authenticated:false);if let catalog=result["nativeCache"] {let bytes=try JSONSerialization.data(withJSONObject:catalog);WebCatalog.shared=try JSONDecoder().decode(WebCatalog.self,from:bytes);UserDefaults.standard.set(bytes,forKey:"backend.catalog.cache")}} catch { /* Keep the bundled or previously validated offline catalog. */ }
    }
    private func restore() async {
        defer {checking=false}
        guard !demo else{return}
        guard api.hasSession else {await prepareApple();return}
        do {try applyProfile(try await api.request("/me"));signedIn=true;await refresh();startPolling()}
        catch {self.error=error.localizedDescription;if !api.hasSession {signedIn=false};await prepareApple()}
    }
    func prepareApple() async {
        guard !demo else{return}
        do {let result=try await api.request("/auth/apple/challenge",method:"POST",authenticated:false);challengeId=result["challengeId"] as? String;nonceHash=result["nonceHash"] as? String}
        catch {if !demo {self.error=error.localizedDescription}}
    }
    func handleApple(_ result:Result<ASAuthorization,Error>) {
        Task {
            do {
                let authorization=try result.get()
                guard let credential=authorization.credential as? ASAuthorizationAppleIDCredential,let token=credential.identityToken.flatMap({String(data:$0,encoding:.utf8)}),let code=credential.authorizationCode.flatMap({String(data:$0,encoding:.utf8)}),let challengeId else {throw NativeAPIError(message:"Bitte starte die Anmeldung erneut.")}
                let name=credential.fullName.map{PersonNameComponentsFormatter().string(from:$0)} ?? ""
                let response=try await api.request("/auth/apple",method:"POST",body:["challengeId":challengeId,"identityToken":token,"authorizationCode":code,"name":name],authenticated:false)
                try api.storeTokens(response)
                guard let user=response["user"] as? [String:Any] else {throw NativeAPIError(message:"Konto konnte nicht geladen werden.")}
                try applyProfile(user);signedIn=true;tab=pendingConversation == nil ? 0 : 3;await refresh();startPolling();await PushNotifications.registerSavedToken()
            } catch {if (error as? ASAuthorizationError)?.code != .canceled {self.error=error.localizedDescription}}
            await prepareApple()
        }
    }
    private func applyProfile(_ profile:[String:Any]) throws {
        guard let id=profile["id"] as? String else {throw NativeAPIError(message:"Ungültiges Benutzerkonto.")}
        if identity != id {
            identity=id;data=LocalData();publicOffers=[];profiles=[:];blockedNames=[:];notes=[:]
            if let draft=UserDefaults.standard.dictionary(forKey:"backend.draft."+id) as? [String:String] {data.listingDraft=draft}
        }
        data.name=profile["name"] as? String ?? "";data.emoji=profile["emoji"] as? String ?? "🍏";data.bio=profile["bio"] as? String ?? "";data.city=profile["city"] as? String ?? "";data.postalCode=profile["postalCode"] as? String ?? ""
        coverMediaId=profile["coverMediaId"] as? String
        onboarding=profile["onboardingCompleted"] as? Bool != true
        data.emailNotifications=onboarding ? true : profile["emailNotifications"] as? Bool ?? false
        lastProfile=try JSONSerialization.data(withJSONObject:profileBody(),options:.sortedKeys)
    }
    private func profileBody()->[String:Any] { ["name":data.name,"emoji":data.emoji,"bio":data.bio ?? "","city":data.city,"postalCode":data.postalCode ?? "","emailNotifications":data.emailNotifications ?? true] }
    func completeOnboarding() async -> Bool {
        do {var body=profileBody();body["onboardingCompleted"]=true;try applyProfile(try await api.request("/me",method:"PATCH",body:body));return true}
        catch {self.error=error.localizedDescription;return false}
    }
    func save() {
        guard signedIn,!demo else{return}
        if let draft=data.listingDraft {UserDefaults.standard.set(draft,forKey:"backend.draft."+identity)}else{UserDefaults.standard.removeObject(forKey:"backend.draft."+identity)}
        guard !onboarding,saving==nil else{return}
        saving=Task {
            defer{saving=nil}
            do {
                while true {
                    let body=profileBody(),bytes=try JSONSerialization.data(withJSONObject:body,options:.sortedKeys)
                    if bytes==lastProfile {break}
                    _=try await api.request("/me",method:"PATCH",body:body);lastProfile=bytes
                }
            } catch {self.error=error.localizedDescription}
        }
    }
    func refresh() async {
        guard signedIn,!demo,!refreshing else{return};refreshing=true;let account=identity
        defer{refreshing=false}
        do {
            let published=try await api.pages("/listings"),own=try await api.pages("/me/listings")
            let favorites=try await api.request("/favorites"),blocks=try await api.request("/blocks"),conversations=try await api.pages("/conversations"),noteRows=try await api.request("/notes")
            var chats:[Conversation]=[]
            for row in conversations {
                guard let id=row["id"] as? String,let listingId=row["listingId"] as? String else{continue}
                if var previous=data.chats.first(where:{$0.id==id}),previous.updatedAt==row["updatedAt"] as? String {
                    previous.archived=row["archived"] as? Bool ?? false;previous.muted=row["muted"] as? Bool ?? false
                    previous.offer.seller=row[row["sellerId"] as? String != account ? "sellerName":"buyerName"] as? String ?? "Gelöschtes Konto"
                    chats.append(previous);continue
                }
                var messages:[ChatMessage]=[],cursor:String?
                repeat {
                    let result=try await api.request("/conversations/"+id+"/messages"+(cursor.map{"?after="+$0} ?? ""))
                    for message in result["items"] as? [[String:Any]] ?? [] {
                        guard let messageId=(message["id"] as? String).flatMap(UUID.init(uuidString:)) else{continue}
                        messages.append(.init(id:messageId,text:message["text"] as? String ?? "",mine:message["senderId"] as? String == account,sentAt:Self.date(message["createdAt"] as? String),sequence:message["sequence"] as? String))
                    }
                    cursor=result["nextCursor"] as? String
                }while cursor != nil
                let otherIsSeller=row["sellerId"] as? String != account
                let listing=(published+own).first{$0["id"] as? String==listingId}.map(Self.offer) ?? Offer(id:listingId,title:row["listingTitle"] as? String ?? "Inserat",category:"",price:Double(row["listingPriceCents"] as? Int ?? 0)/100,city:"",detail:"",seller:row["sellerName"] as? String ?? "")
                var display=listing;display.seller=row[otherIsSeller ? "sellerName":"buyerName"] as? String ?? "Gelöschtes Konto";display.sellerId=row[otherIsSeller ? "sellerId":"buyerId"] as? String ?? ""
                let offerResult=try await api.request("/conversations/"+id+"/offers")
                let purchaseOffers=try JSONDecoder().decode([PurchaseOffer].self,from:JSONSerialization.data(withJSONObject:offerResult["items"] ?? []))
                chats.append(.init(backendId:id,offer:display,messages:messages,purchaseOffers:purchaseOffers,archived:row["archived"] as? Bool ?? false,muted:row["muted"] as? Bool ?? false,updatedAt:row["updatedAt"] as? String))
            }
            guard account==identity,signedIn else{return}
            notes=Dictionary(uniqueKeysWithValues:(noteRows["items"] as? [[String:Any]] ?? []).compactMap { row in guard let id=row["listingId"] as? String,let note=row["note"] as? String else {return nil};return(id,note) })
            publicOffers=published.map(Self.offer);data.ownOffers=own.map(Self.offer);data.favorites=Set(favorites["items"] as? [String] ?? []);data.chats=chats
            let blocked=blocks["items"] as? [[String:Any]] ?? [];data.blockedSellers=blocked.compactMap{$0["id"] as? String};blockedNames=Dictionary(uniqueKeysWithValues:blocked.compactMap{row in guard let id=row["id"] as? String else{return nil};return(id,row["name"] as? String ?? "Profil")})
            if !api.hasSession {clearLocalSession()}
        } catch {self.error=error.localizedDescription;if !api.hasSession{clearLocalSession()}}
    }
    private func startPolling(){polling?.cancel();polling=Task{while !Task.isCancelled {try? await Task.sleep(for:.seconds(5));if Task.isCancelled{return};if UIApplication.shared.applicationState == .active {await refresh();await presence()}}}}
    func toggleFavorite(_ offer:Offer){if demo {if data.favorites.contains(offer.id){data.favorites.remove(offer.id)}else{data.favorites.insert(offer.id)};return};Task{do{_=try await api.request("/favorites/"+offer.id,method:data.favorites.contains(offer.id) ? "DELETE":"PUT");await refresh()}catch{self.error=error.localizedDescription}}}
    func isBlocked(_ id:String)->Bool {data.blockedSellers?.contains(id)==true}
    func block(_ id:String){Task{do{_=try await api.request("/blocks/"+id,method:"PUT");await refresh()}catch{self.error=error.localizedDescription}}}
    func unblock(_ id:String){Task{do{_=try await api.request("/blocks/"+id,method:"DELETE");await refresh()}catch{self.error=error.localizedDescription}}}
    func startChat(_ offer:Offer) async -> String? {if demo {if !data.chats.contains(where:{$0.offer.id==offer.id}){data.chats.append(Conversation(offer:offer,messages:[]))};return offer.id};do{let result=try await api.request("/conversations",method:"POST",body:["listingId":offer.id]);await refresh();return result["id"] as? String}catch{self.error=error.localizedDescription;return nil}}
    func submitPurchase(_ offer:Offer,key:String) async -> String? {
        guard offer.sellerId != identity,!isBlocked(offer.sellerId) else {return nil}
        guard let conversation=await startChat(offer) else {return nil}
        do {
            _=try await api.request("/conversations/"+conversation+"/offers",method:"POST",body:["priceCents":Int((offer.price*100).rounded())],key:key)
            await refresh();return conversation
        } catch {self.error=error.localizedDescription;return nil}
    }
    func resolvePurchase(_ id:String,accept:Bool) async -> Bool {
        do { _=try await api.request("/offers/"+id,method:"PATCH",body:["status":accept ? "accepted":"declined"]);await refresh();return true }
        catch {self.error=error.localizedDescription;return false}
    }
    func send(_ text:String,to id:String) async -> Bool {
        if demo {guard let index=data.chats.firstIndex(where:{$0.id==id}) else{return false};data.chats[index].messages.append(ChatMessage(text:text,mine:true));return true}
        guard !text.trimmingCharacters(in:.whitespacesAndNewlines).isEmpty else{return false}
        do{_=try await api.postDurably("/conversations/"+id+"/messages",body:["text":text],account:identity);await refresh();return true}catch{self.error=error.localizedDescription;return false}
    }
    func markVisible(_ message:ChatMessage,in id:String,visible:Bool){
        guard let sequence=message.sequence else{return}
        if visible {visibleMessageSequences[id,default:[]].insert(sequence)}else{visibleMessageSequences[id]?.remove(sequence)}
        if activeConversation==id{Task{await presence()}}
    }
    func presence() async {
        guard !demo,let id=activeConversation else{return}
        let active=UIApplication.shared.applicationState == .active
        _=try? await api.request("/conversations/"+id,method:"PATCH",body:["active":active,"readSequences":active ? Array(visibleMessageSequences[id] ?? []).prefix(100).map{$0}:[]])
    }
    func closeConversation(_ id:String){activeConversation=nil;guard !demo else{return};Task{_=try? await api.request("/conversations/"+id,method:"PATCH",body:["active":false])}}
    func setConversation(_ id:String,archived:Bool?=nil,muted:Bool?=nil){Task{var body:[String:Any]=[:];if let archived{body["archived"]=archived};if let muted{body["muted"]=muted};do{_=try await api.request("/conversations/"+id,method:"PATCH",body:body);await refresh()}catch{self.error=error.localizedDescription}}}
    func publish(_ offer:Offer,key:String,editing:Offer?=nil) async -> Bool {
        let s=offer.specs ?? [:];var specs:[String:Any]=[:]
        for (source,target) in ["chip":"chip","color":"colorId","size":"size","memory":"memory","storage":"storage","condition":"condition","shipping":"shippingScope","connectivity":"connectivity","simLock":"simLock","keyboard":"keyboardLayout","keyboardDetails":"keyboardLayoutDetails","warrantyUntil":"appleWarrantyUntil","street":"street","locality":"locality"] {if let value=s[source]{specs[target]=value}}
        for (source,target) in ["year":"year","capacity":"batteryMaxCapacityPercent","cycles":"batteryCycleCount"] {if let value=s[source].flatMap(Int.init){specs[target]=value}}
        specs["originalBox"]=s["packaging"]=="yes"
        var body:[String:Any]=["categoryId":s["category"] ?? "","modelId":s["model"] ?? "","priceCents":Int((offer.price*100).rounded()),"specs":specs,"city":offer.city,"postalCode":s["postalCode"] ?? ""]
        if let editing{body["version"]=editing.version;body["status"]=editing.status}
        do {let response=try await api.request("/listings"+(editing.map{"/"+$0.id} ?? ""),method:editing == nil ? "POST":"PATCH",body:body,key:editing == nil ? key:nil);let saved=Self.offer(response);data.ownOffers.removeAll{$0.id==saved.id};data.ownOffers.insert(saved,at:0);if editing == nil{data.listingDraft=nil;save()}else{UserDefaults.standard.removeObject(forKey:"backend.editdraft."+identity+saved.id)};await refresh();return true}
        catch{self.error=error.localizedDescription;return false}
    }
    func loadProfile(_ id:String) async {guard !demo,!id.isEmpty else{return};do{let result=try await api.request("/users/"+id);let bytes=try JSONSerialization.data(withJSONObject:result);profiles[id]=try JSONDecoder().decode(CatalogSeller.self,from:bytes)}catch{self.error=error.localizedDescription}}

    func propose(_ cents:Int,in id:String) async -> Bool {do{_=try await api.postDurably("/conversations/"+id+"/offers",body:["priceCents":cents],account:identity);await refresh();return true}catch{self.error=error.localizedDescription;return false}}
    func resolve(_ offer:PurchaseOffer,status:String){Task{do{_=try await api.request("/offers/"+offer.id,method:"PATCH",body:["status":status]);await refresh()}catch{self.error=error.localizedDescription}}}
    func rate(_ offer:PurchaseOffer,positive:Bool){Task{do{_=try await api.request("/ratings",method:"POST",body:["offerId":offer.id,"score":positive ? 5:1]);self.error="Bewertung gespeichert."}catch{self.error=error.localizedDescription}}}
    func setNote(_ note:String,for id:String){Task{do{_=try await api.request("/notes/"+id,method:"PUT",body:["note":String(note.prefix(200))]);notes[id]=note}catch{self.error=error.localizedDescription}}}
    func report(_ offer:Offer,reason:String){Task{do{_=try await api.request("/reports",method:"POST",body:["listingId":offer.id,"reason":reason]);self.error="Deine Meldung wurde gespeichert."}catch{self.error=error.localizedDescription}}}
    func updateListing(_ offer:Offer,status:String){Task{do{_=try await api.request("/listings/"+offer.id,method:"PATCH",body:["version":offer.version ?? 1,"status":status]);await refresh()}catch{self.error=error.localizedDescription}}}
    func removeListing(_ offer:Offer){Task{do{_=try await api.request("/listings/"+offer.id,method:"DELETE");await refresh()}catch{self.error=error.localizedDescription}}}
    func uploadCover(_ bytes:Data) async {
        guard bytes.count<=8*1024*1024,let image=UIImage(data:bytes),let jpeg=image.jpegData(compressionQuality:0.85) else {error="Bitte wähle ein Bild mit höchstens 8 MB.";return}
        do {
            let uploaded=try await api.request("/media",method:"POST",uploadData:jpeg,mediaType:"image/jpeg")
            guard let id=uploaded["id"] as? String else{throw NativeAPIError(message:"Bild konnte nicht gespeichert werden.")}
            let old=coverMediaId
            _=try await api.request("/me",method:"PATCH",body:["coverMediaId":id]);coverMediaId=id
            if let old,old != id{_=try? await api.request("/media/"+old,method:"DELETE")}
        }catch{self.error=error.localizedDescription}
    }
    func removeCover(){Task{do{if let id=coverMediaId{_=try await api.request("/media/"+id,method:"DELETE");coverMediaId=nil}}catch{self.error=error.localizedDescription}}}
    func logout(){
        #if DEBUG
        if demo {demo=false;api.screenshotMode=false;clearLocalSession();Task{await prepareApple()};return}
        #endif
        Task{do{_=try await api.request("/auth/logout",method:"POST");api.clear();clearLocalSession();await prepareApple()}catch{self.error=error.localizedDescription}}}
    func deleteAccount(){Task{do{_=try await api.request("/me",method:"DELETE");UserDefaults.standard.removeObject(forKey:"backend.draft."+identity);api.clear();clearLocalSession();await prepareApple()}catch{self.error=error.localizedDescription}}}
    private func clearLocalSession(){polling?.cancel();saving?.cancel();identity="";data=LocalData();publicOffers=[];profiles=[:];blockedNames=[:];notes=[:];coverMediaId=nil;signedIn=false;tab=0;onboarding=false;activeConversation=nil;visibleMessageSequences=[:]}
    static func date(_ value:String?)->Date? {guard let value else{return nil};let f=ISO8601DateFormatter();f.formatOptions=[.withInternetDateTime,.withFractionalSeconds];return f.date(from:value) ?? ISO8601DateFormatter().date(from:value)}
    static func offer(_ row:[String:Any])->Offer {
        let s=row["specs"] as? [String:Any] ?? [:];var values:[String:String]=[:]
        for (source,target) in ["chip":"chip","year":"year","colorId":"color","size":"size","memory":"memory","storage":"storage","condition":"condition","shippingScope":"shipping","connectivity":"connectivity","simLock":"simLock","keyboardLayout":"keyboard","keyboardLayoutDetails":"keyboardDetails","batteryMaxCapacityPercent":"capacity","batteryCycleCount":"cycles","appleWarrantyUntil":"warrantyUntil"] {if let value=s[source],!(value is NSNull){values[target]=String(describing:value)}}
        values["packaging"]=(s["originalBox"] as? Bool)==true ? "yes":"no";values["model"]=row["modelId"] as? String;values["category"]=row["categoryId"] as? String;values["postalCode"]=row["postalCode"] as? String;values["createdAt"]=row["createdAt"] as? String
        return Offer(id:row["id"] as? String ?? "",title:row["title"] as? String ?? "",category:WebCatalog.shared.categories.first{$0.id==row["categoryId"] as? String}?.label ?? "",price:Double(row["priceCents"] as? Int ?? 0)/100,city:row["city"] as? String ?? "",detail:"",seller:row["sellerName"] as? String ?? "",specs:values,sellerId:row["sellerId"] as? String ?? "",number:row["number"] as? String,version:row["version"] as? Int,status:row["status"] as? String ?? "public")
    }
}

// Explicit German dates; legacy messages without a timestamp remain undated.
enum GermanDate {
    static func date(_ raw: String) -> String {
        let dateOnly=String(raw.prefix(10)).split(separator:"-")
        guard dateOnly.count==3 else { return raw }
        return "\(dateOnly[2]).\(dateOnly[1]).\(dateOnly[0])"
    }
    static func message(_ date: Date) -> String {
        let formatter=DateFormatter();formatter.locale=Locale(identifier:"de_DE")
        formatter.dateFormat=Calendar.current.isDateInToday(date) ? "HH:mm" : "dd.MM.yy HH:mm"
        return formatter.string(from:date)
    }
}
