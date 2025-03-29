const SettingsTab = () => {
  return (
    <div className="mt-6">
      <div className="bg-white rounded-lg border shadow-sm">
        <div className="p-6 border-b">
          <h2 className="text-xl font-semibold">Paramètres du compte</h2>
          <p className="text-gray-500 text-sm mt-1">
            Gérez les paramètres de votre compte et vos préférences
          </p>
        </div>
        <div className="p-6 space-y-6">
          <div className="space-y-2">
            <div className="font-medium">Langue</div>
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <div>Français</div>
                <div className="text-sm text-gray-500">
                  La langue utilisée dans l&apos;interface
                </div>
              </div>
              <button className="px-3 py-1.5 border border-gray-300 rounded-md text-sm font-medium hover:bg-gray-50 transition-colors">
                Changer
              </button>
            </div>
          </div>
          <div className="space-y-2">
            <div className="font-medium">Notifications</div>
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <div>Email</div>
                <div className="text-sm text-gray-500">
                  Recevoir des notifications par email
                </div>
              </div>
              <button className="px-3 py-1.5 border border-gray-300 rounded-md text-sm font-medium hover:bg-gray-50 transition-colors">
                Configurer
              </button>
            </div>
          </div>
          <div className="space-y-2">
            <div className="font-medium">Sécurité</div>
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <div>Mot de passe</div>
                <div className="text-sm text-gray-500">
                  Dernière modification il y a 3 mois
                </div>
              </div>
              <button className="px-3 py-1.5 border border-gray-300 rounded-md text-sm font-medium hover:bg-gray-50 transition-colors">
                Modifier
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default SettingsTab;
