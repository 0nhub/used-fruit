import UIKit
import UserNotifications

@MainActor final class PushNotifications: NSObject, UIApplicationDelegate, UNUserNotificationCenterDelegate {
    static weak var store: AppStore?
    func application(_ application:UIApplication,didFinishLaunchingWithOptions options:[UIApplication.LaunchOptionsKey:Any]?=nil)->Bool {
        UNUserNotificationCenter.current().delegate=self
        return true
    }
    func application(_ application:UIApplication,didRegisterForRemoteNotificationsWithDeviceToken deviceToken:Data) {
        let token=deviceToken.map{String(format:"%02x",$0)}.joined()
        UserDefaults.standard.set(token,forKey:"backend.apns-token")
        Task{await Self.registerSavedToken()}
    }
    func application(_ application:UIApplication,didFailToRegisterForRemoteNotificationsWithError error:Error) {
        Self.store?.error="Push konnte nicht aktiviert werden. Du kannst Used Fruit weiter nutzen."
    }
    static func requestPermission() async {
        do {
            let allowed=try await UNUserNotificationCenter.current().requestAuthorization(options:[.alert,.badge,.sound])
            if allowed{UIApplication.shared.registerForRemoteNotifications()}
        } catch {store?.error="Push konnte nicht aktiviert werden. Du kannst Used Fruit weiter nutzen."}
    }
    static func registerSavedToken() async {
        guard NativeAPI.shared.hasSession,let token=UserDefaults.standard.string(forKey:"backend.apns-token") else{return}
        let settings=await UNUserNotificationCenter.current().notificationSettings()
        guard settings.authorizationStatus == .authorized || settings.authorizationStatus == .provisional else{return}
        #if DEBUG
        let environment="sandbox"
        #else
        let environment="production"
        #endif
        do{_=try await NativeAPI.shared.request("/devices",method:"POST",body:["token":token,"environment":environment])}catch{store?.error=error.localizedDescription}
    }
    nonisolated func userNotificationCenter(_ center:UNUserNotificationCenter,willPresent notification:UNNotification) async -> UNNotificationPresentationOptions {
        let id=notification.request.content.userInfo["conversationId"] as? String
        return await MainActor.run {
            if let id,Self.store?.activeConversation==id{return []}
            return [.banner,.sound,.list]
        }
    }
    nonisolated func userNotificationCenter(_ center:UNUserNotificationCenter,didReceive response:UNNotificationResponse) async {
        guard let id=response.notification.request.content.userInfo["conversationId"] as? String,UUID(uuidString:id) != nil else{return}
        await MainActor.run {Self.store?.pendingConversation=id;Self.store?.tab=3}
    }
}
