/**
 * ⚙️ SETTINGS PAGE - System Configuration
 * ========================================
 * 
 * Global settings and preferences for the Construction Syndicate GUI
 */

import React, { useState } from 'react';
import BlueprintPanel from '../components/shared/BlueprintPanel';

const SettingsPage = () => {
  const [settings, setSettings] = useState({
    apiUrl: 'http://localhost:3001',
    wsUrl: 'ws://localhost:3001',
    updateInterval: 2000,
    enableWebSocket: true,
    enableDeepInspection: true,
    theme: 'blueprint',
    notifications: {
      desktop: true,
      sound: false,
      email: false
    }
  });

  const updateSetting = (key, value) => {
    setSettings({ ...settings, [key]: value });
  };

  const handleSave = () => {
    localStorage.setItem('construction-gui-settings', JSON.stringify(settings));
    alert('Settings saved successfully!');
  };

  return (
    <div className="settings-page space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-4xl font-architectural text-compliance-green mb-2">
          ⚙️ SYSTEM SETTINGS
        </h1>
        <p className="text-steel-300 font-body">
          Configure Construction Syndicate GUI preferences
        </p>
      </div>

      {/* Connection Settings */}
      <BlueprintPanel title="🔗 CONNECTION SETTINGS" icon="🌐">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-mono text-steel-300 mb-2">
              API URL:
            </label>
            <input
              type="text"
              value={settings.apiUrl}
              onChange={(e) => updateSetting('apiUrl', e.target.value)}
              className="w-full px-4 py-2 bg-steel-700 border-2 border-steel-500 rounded focus:border-compliance-green focus:outline-none font-mono"
            />
          </div>

          <div>
            <label className="block text-sm font-mono text-steel-300 mb-2">
              WebSocket URL:
            </label>
            <input
              type="text"
              value={settings.wsUrl}
              onChange={(e) => updateSetting('wsUrl', e.target.value)}
              className="w-full px-4 py-2 bg-steel-700 border-2 border-steel-500 rounded focus:border-compliance-green focus:outline-none font-mono"
            />
          </div>

          <div>
            <label className="block text-sm font-mono text-steel-300 mb-2">
              Update Interval: {settings.updateInterval}ms
            </label>
            <input
              type="range"
              min="1000"
              max="10000"
              step="1000"
              value={settings.updateInterval}
              onChange={(e) => updateSetting('updateInterval', parseInt(e.target.value))}
              className="w-full h-2 bg-steel-600 rounded-lg appearance-none cursor-pointer accent-compliance-green"
            />
          </div>

          <label className="flex items-center space-x-3 cursor-pointer">
            <input
              type="checkbox"
              checked={settings.enableWebSocket}
              onChange={(e) => updateSetting('enableWebSocket', e.target.checked)}
              className="w-5 h-5 accent-compliance-green"
            />
            <span className="font-body">Enable WebSocket real-time updates</span>
          </label>

          <label className="flex items-center space-x-3 cursor-pointer">
            <input
              type="checkbox"
              checked={settings.enableDeepInspection}
              onChange={(e) => updateSetting('enableDeepInspection', e.target.checked)}
              className="w-5 h-5 accent-compliance-green"
            />
            <span className="font-body">Enable deep state inspection (may impact performance)</span>
          </label>
        </div>
      </BlueprintPanel>

      {/* Notification Settings */}
      <BlueprintPanel title="🔔 NOTIFICATION SETTINGS" icon="📬" variant="glass">
        <div className="space-y-3">
          <label className="flex items-center space-x-3 cursor-pointer">
            <input
              type="checkbox"
              checked={settings.notifications.desktop}
              onChange={(e) => updateSetting('notifications', { ...settings.notifications, desktop: e.target.checked })}
              className="w-5 h-5 accent-compliance-green"
            />
            <span className="font-body">Desktop notifications</span>
          </label>

          <label className="flex items-center space-x-3 cursor-pointer">
            <input
              type="checkbox"
              checked={settings.notifications.sound}
              onChange={(e) => updateSetting('notifications', { ...settings.notifications, sound: e.target.checked })}
              className="w-5 h-5 accent-compliance-green"
            />
            <span className="font-body">Sound alerts</span>
          </label>

          <label className="flex items-center space-x-3 cursor-pointer">
            <input
              type="checkbox"
              checked={settings.notifications.email}
              onChange={(e) => updateSetting('notifications', { ...settings.notifications, email: e.target.checked })}
              className="w-5 h-5 accent-compliance-green"
            />
            <span className="font-body">Email notifications</span>
          </label>
        </div>
      </BlueprintPanel>

      {/* Save Button */}
      <div className="flex justify-center">
        <button
          onClick={handleSave}
          className="btn-industrial px-12 py-4 text-lg"
        >
          💾 SAVE SETTINGS
        </button>
      </div>
    </div>
  );
};

export default SettingsPage;

