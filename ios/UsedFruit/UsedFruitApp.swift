import SwiftUI
import AuthenticationServices
import UIKit

@main struct UsedFruitApp: App {
    @UIApplicationDelegateAdaptor(PushNotifications.self) private var push
    @Environment(\.scenePhase) private var scenePhase
    @State private var store = AppStore()
    var body: some Scene {
        WindowGroup {
            Group {
                if store.checking { ProgressView("Used Fruit") }
                else if store.signedIn || store.browsingAsGuest { MainTabs() }
                else { WelcomeView() }
            }
            .environment(store)
            .onAppear { PushNotifications.store=store }
            .onChange(of:scenePhase) { if scenePhase == .active { Task { await store.refresh();await store.presence();await PushNotifications.registerSavedToken() } } else { Task { await store.presence() } } }
            .tint(.blue)
            .sheet(isPresented: Binding(get: { store.wantsLogin }, set: { store.wantsLogin = $0 })) { WelcomeView(allowsSkip: false, allowsDismiss: true).environment(store) }
            .sheet(isPresented: Binding(get: { store.onboarding }, set: { _ in })) { NativeOnboarding().environment(store).interactiveDismissDisabled() }
            .alert("Used Fruit", isPresented: Binding(get: { store.error != nil }, set: { if !$0 { store.error = nil } })) { Button("OK") { store.error = nil } } message: { Text(store.error ?? "") }
            .onReceive(NotificationCenter.default.publisher(for: ASAuthorizationAppleIDProvider.credentialRevokedNotification)) { _ in store.logout() }
        }
    }
}
struct WelcomeView: View {
    @Environment(AppStore.self) private var store
    var allowsSkip = true
    var allowsDismiss = false
    @State private var logoTaps = 0
    @State private var lastLogoTap = Date.distantPast
    var body: some View {
        VStack(spacing: 24) {
            if allowsDismiss {
                HStack { Spacer(); Button("Weiter stöbern") { store.wantsLogin = false }.font(.subheadline) }
            }
            Spacer()
            Image("Brand")
                .resizable()
                .scaledToFit()
                .frame(width: 100, height: 100)
                .contentShape(Rectangle())
                .onTapGesture { secretDemoTap() }
                .accessibilityIdentifier("brand-logo")
            VStack(spacing: 12) {
                Text("Used Fruit").font(.system(size: 42, weight: .bold, design: .rounded)).multilineTextAlignment(.center)
                Text(allowsDismiss ? "Melde dich an, um Nachrichten,\nFavoriten und dein Konto zu nutzen." : "Dein nächstes Lieblingsgerät.\nGebraucht entdeckt. Neu verliebt.").font(.title3).foregroundStyle(.secondary).multilineTextAlignment(.center)
            }
            Spacer()
            SignInWithAppleButton(.continue, onRequest: { $0.requestedScopes = [.fullName, .email]; $0.nonce = store.nonceHash }, onCompletion: store.handleApple)
                .signInWithAppleButtonStyle(.black).frame(height: 52).clipShape(.capsule)
            .disabled(store.nonceHash == nil)
            if store.nonceHash == nil { Button("Verbindung erneut versuchen") { Task { await store.prepareApple() } } }
            if allowsSkip {
                Button("Ohne Anmeldung weiter") { store.browseAsGuest() }
                    .buttonStyle(.bordered).controlSize(.large)
                    .accessibilityIdentifier("guest-continue")
            }
            #if DEBUG
            Button("Mit Testkonto starten") { store.startDemo() }
                .buttonStyle(.bordered).controlSize(.large)
                .accessibilityIdentifier("demo-login")
            #endif
            HStack { Link("Datenschutz", destination: URL(string: "https://usedfruit.de/datenschutz")!); Text("·"); Link("Nutzungsbedingungen", destination: URL(string: "https://usedfruit.de/nutzerbedingungen")!) }.font(.caption)
        }.padding(28).background(Color(.systemBackground))
        .task { await store.prepareApple() }
    }
    private func secretDemoTap() {
        let now = Date()
        if now.timeIntervalSince(lastLogoTap) > 4 { logoTaps = 0 }
        lastLogoTap = now
        logoTaps += 1
        guard logoTaps >= 10 else { return }
        logoTaps = 0
        UIImpactFeedbackGenerator(style: .medium).impactOccurred()
        store.startDemo()
    }
}
struct MainTabs: View {
    @Environment(AppStore.self) private var store
    var body: some View {
        @Bindable var store = store
        TabView(selection: $store.tab) {
            Tab(value: 0) { DiscoverView() } label: { Image(systemName: store.tab == 0 ? "safari.fill" : "safari").environment(\.symbolVariants, .none).accessibilityLabel("Entdecken") }
            Tab(value: 3) { InboxView() } label: { Image(systemName: store.tab == 3 ? "bubble.left.and.bubble.right.fill" : "bubble.left.and.bubble.right").environment(\.symbolVariants, .none).accessibilityLabel("Nachrichten") }
            Tab(value: 4) { AccountView() } label: { Image(systemName: store.tab == 4 ? "person.fill" : "person").environment(\.symbolVariants, .none).accessibilityLabel("Konto") }
            Tab(value: 2) { CreateOfferView() } label: { Image(systemName: store.tab == 2 ? "plus.circle.fill" : "plus.circle").environment(\.symbolVariants, .none).accessibilityLabel("Inserieren") }
        }.toolbarBackground(.hidden,for:.tabBar)
        .onChange(of: store.tab) { _, tab in
            if !store.signedIn && [2, 3, 4].contains(tab) {
                store.tab = 0
                store.wantsLogin = true
            }
        }
    }
}

struct NativeOnboarding: View {
    @Environment(AppStore.self) private var store
    @State private var busy=false
    var body: some View {
        @Bindable var store=store
        NavigationStack { Form {
            Section("Dein Konto") { TextField("Name",text:$store.data.name);TextField("Profil-Emoji",text:$store.data.emoji) }
            Section { Toggle("E-Mail bei neuen Nachrichten",isOn:Binding(get:{store.data.emailNotifications ?? true},set:{store.data.emailNotifications=$0})) } footer: { Text("Wenn eine Nachricht nach zwei Minuten noch ungelesen ist. Du kannst die Einstellung jederzeit im Konto ändern.") }
            Button("Konto fertigstellen") { busy=true;Task{_=await store.completeOnboarding();busy=false} }.disabled(busy || store.data.name.trimmingCharacters(in:.whitespacesAndNewlines).isEmpty)
        }.navigationTitle("Willkommen") }
    }
}
