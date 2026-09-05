import Foundation
@main struct CatalogParity {
 static func main() throws {
  let data=try Data(contentsOf:URL(fileURLWithPath:CommandLine.arguments[1]))
  let catalog=try JSONDecoder().decode(WebCatalog.self,from:data)
  for test in catalog.fixtures {
   var values=["model":test.modelId];values["chip"]=test.chip;values["year"]=test.year.map(String.init);values["connectivity"]=test.connectivity
   precondition(catalog.wizardSteps(values)==test.steps,"Wizard differs: \(test.modelId) \(test.chip ?? "") \(test.year ?? 0)")
  }
  var iphone=catalog.normalize(["category":"iphone"])
  precondition(catalog.wizardSteps(iphone).contains("simLock"));precondition(!catalog.wizardSteps(iphone).contains("keyboard"))
  precondition(!catalog.valid("battery",values:iphone));iphone["battery"]="101";precondition(!catalog.valid("battery",values:iphone));iphone["battery"]="90";precondition(catalog.valid("battery",values:iphone))
  iphone["price"]="0";precondition(!catalog.valid("price",values:iphone));iphone["price"]="749,50";precondition(catalog.valid("price",values:iphone))
  let wifi=catalog.normalize(["category":"ipad","model":"ipad-air","connectivity":"wifi"])
  precondition(!catalog.wizardSteps(wifi).contains("simLock"))
  var cellular=wifi;cellular["connectivity"]="cellular";precondition(catalog.wizardSteps(cellular).contains("simLock"))
  var mac=catalog.normalize(["category":"mac","model":"macbook-air"])
  precondition(catalog.wizardSteps(mac).contains("keyboard"));mac["keyboard"]="other";precondition(!catalog.valid("keyboard",values:mac));mac["keyboardDetails"]="Dänisch";precondition(catalog.valid("keyboard",values:mac))
  mac["battery"]="1.5";precondition(!catalog.valid("battery",values:mac));mac["battery"]="0";precondition(catalog.valid("battery",values:mac))
  mac["city"]="Stuttgart";mac["postalCode"]="70173";precondition(!catalog.valid("location",values:mac));mac["locality"]="Mitte";precondition(catalog.valid("location",values:mac))
  print("\(catalog.fixtures.count) web/native wizard parity cases and validation checks passed")
 }
}
