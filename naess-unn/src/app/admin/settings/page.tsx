import { getSettings } from "@/lib/settings";
import SettingsForm from "./SettingsForm";
export default async function Page() {
  return (<div><h1 className="mb-6 text-2xl font-bold text-primary">Site Settings</h1><SettingsForm s={await getSettings()} /></div>);
}
