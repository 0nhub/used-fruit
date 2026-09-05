import XCTest
final class MarketplaceUITests: XCTestCase {
 @MainActor func testNavigationFiltersAndWizard() {
  let app=XCUIApplication();app.launchArguments=["--ui-testing"];app.launch()
  let demo=app.buttons["demo-login"]
  if demo.waitForExistence(timeout:8){demo.tap()}
  XCTAssertTrue(app.buttons["Filter"].waitForExistence(timeout:5))
  XCTAssertEqual(app.tabBars.buttons.count,4)
  XCTAssertFalse(app.staticTexts.matching(NSPredicate(format:"label BEGINSWITH %@","Tastatur:")).firstMatch.exists)
  XCTAssertFalse(app.searchFields.firstMatch.exists)
  XCTAssertFalse(app.navigationBars["Used Fruit"].exists)
  let firstPrice=app.staticTexts.matching(NSPredicate(format:"label CONTAINS %@","759,00")).firstMatch
  let secondPrice=app.staticTexts.matching(NSPredicate(format:"label CONTAINS %@","949,00")).firstMatch
  XCTAssertTrue(firstPrice.exists);XCTAssertTrue(secondPrice.exists)
  XCTAssertEqual(firstPrice.frame.minY,secondPrice.frame.minY,accuracy:1)
  let shot=XCTAttachment(screenshot:app.screenshot());shot.name="Aligned-catalog";shot.lifetime = .keepAlways;add(shot)
  app.buttons["Filter"].tap()
  XCTAssertTrue(app.staticTexts["Standort"].waitForExistence(timeout:3))
  XCTAssertTrue(app.staticTexts["Modelle"].exists)
  XCTAssertTrue(app.staticTexts["Originalverpackung"].exists)
  app.buttons["Schließen"].tap()
  app.tabBars.buttons.element(boundBy:1).tap()
  XCTAssertTrue(app.staticTexts["Kategorie"].waitForExistence(timeout:3))
  XCTAssertFalse(app.buttons["Abbrechen"].exists)
  XCTAssertFalse(app.progressIndicators.firstMatch.exists)
  func next(){let button=app.buttons["Weiter"];for _ in 0..<8{if button.isHittable{break};app.swipeUp()};button.tap()}
  for _ in 0..<16 {
   if app.textFields["Maximale Kapazität (%)"].exists {break}
   next()
  }
  let battery=app.textFields["Maximale Kapazität (%)"]
  XCTAssertTrue(battery.exists);battery.tap();battery.typeText("90")
  next()
  let price=app.textFields["0,00"];XCTAssertTrue(price.waitForExistence(timeout:3));price.tap();price.typeText("749")
  next()
  let location=app.textFields["PLZ oder Stadt"];location.tap();location.typeText("70173")
  app.buttons["70173 Stuttgart"].tap()
  let district=app.textFields["Ortsteil"];district.tap();district.typeText("Mitte")
  next()
  XCTAssertTrue(app.buttons["Demo-Inserat speichern"].isEnabled)
  app.tabBars.buttons.element(boundBy:2).tap()
  XCTAssertGreaterThanOrEqual(app.cells.count,3)
  app.cells.firstMatch.tap()
  XCTAssertTrue(app.staticTexts["Hallo! Ist das Gerät noch verfügbar?"].waitForExistence(timeout:3))
  app.tabBars.buttons.element(boundBy:3).tap()
  app.buttons["Profil-Icon ändern"].tap()
  XCTAssertTrue(app.buttons["Icon 🦊"].waitForExistence(timeout:3));app.buttons["Icon 🦊"].tap()
  XCTAssertTrue(app.buttons["Favoriten"].waitForExistence(timeout:3))
  app.swipeUp()
  XCTAssertTrue(app.switches["Neue Nachrichten per E-Mail"].exists)
  app.buttons["Blockierte Profile"].tap()
  XCTAssertTrue(app.staticTexts["Keine blockierten Profile"].waitForExistence(timeout:3))
 }
}
