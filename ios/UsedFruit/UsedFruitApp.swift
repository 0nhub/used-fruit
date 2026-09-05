import SwiftUI
import AuthenticationServices

@main struct UsedFruitApp: App {
    @State private var store = AppStore()
    var body: some Scene {
        WindowGroup {
            Group {
                if store.checking { ProgressView("Used Fruit") }
                else if store.signedIn { MainTabs() }
                else { WelcomeView() }
            }
            .environment(store)
            .tint(.blue)
            .alert("Anmeldung", isPresented: Binding(get: { store.error != nil }, set: { if !$0 { store.error = nil } })) { Button("OK") { store.error = nil } } message: { Text(store.error ?? "") }
            .onReceive(NotificationCenter.default.publisher(for: ASAuthorizationAppleIDProvider.credentialRevokedNotification)) { _ in store.logout() }
        }
    }
}
struct WelcomeView: View {
    @Environment(AppStore.self) private var store
    var body: some View {
        VStack(spacing: 24) {
            Spacer()
            Image("Brand").resizable().scaledToFit().frame(width: 100, height: 100)
            VStack(spacing: 12) {
                Text("Gutes bleibt.\nUsed Fruit.").font(.system(size: 42, weight: .bold, design: .rounded)).multilineTextAlignment(.center)
                Text("Dein nächstes Lieblingsgerät.\nGebraucht entdeckt. Neu verliebt.").font(.title3).foregroundStyle(.secondary).multilineTextAlignment(.center)
            }
            Spacer()
            SignInWithAppleButton(.continue, onRequest: { $0.requestedScopes = [.fullName, .email] }, onCompletion: store.handleApple)
                .signInWithAppleButtonStyle(.black).frame(height: 52).clipShape(.capsule)
            #if DEBUG
            Button("Mit Test-Account starten") { store.enterDemo() }.buttonStyle(.glass).controlSize(.large)
                .accessibilityIdentifier("demo-login")
            Text("Lokale Demo · keine echten Käufe oder Nachrichten").font(.caption).foregroundStyle(.secondary).multilineTextAlignment(.center)
            #endif
            HStack { Link("Datenschutz", destination: URL(string: "https://usedfruit.de/datenschutz")!); Text("·"); Link("Nutzungsbedingungen", destination: URL(string: "https://usedfruit.de/nutzerbedingungen")!) }.font(.caption)
        }.padding(28).background(Color(.systemBackground))
    }
}
struct MainTabs: View {
    @Environment(AppStore.self) private var store
    var body: some View {
        @Bindable var store = store
        TabView(selection: $store.tab) {
            Tab(value: 0) { DiscoverView() } label: { Image(systemName: store.tab == 0 ? "safari.fill" : "safari").environment(\.symbolVariants, .none).accessibilityLabel("Entdecken") }
            Tab(value: 2) { CreateOfferView() } label: { Image(systemName: store.tab == 2 ? "plus.circle.fill" : "plus.circle").environment(\.symbolVariants, .none).accessibilityLabel("Inserieren") }
            Tab(value: 3) { InboxView() } label: { Image(systemName: store.tab == 3 ? "bubble.left.and.bubble.right.fill" : "bubble.left.and.bubble.right").environment(\.symbolVariants, .none).accessibilityLabel("Nachrichten") }
            Tab(value: 4) { AccountView() } label: { Image(systemName: store.tab == 4 ? "person.fill" : "person").environment(\.symbolVariants, .none).accessibilityLabel("Konto") }
        }
    }
}
