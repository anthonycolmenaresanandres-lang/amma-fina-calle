using System;
using System.Linq;
using UnityEditor;
using UnityEngine;

namespace ShadowDoors.Editor
{
    /// <summary>
    /// Reproducible project settings for the fresh-project overlay workflow. This
    /// intentionally uses Unity's serialized PlayerSettings object instead of editing
    /// ProjectSettings.asset on disk.
    /// </summary>
    public static class ProjectConfiguration
    {
        private const string ActiveInputHandlerProperty = "activeInputHandler";
        private const int InputSystemOnly = 1;

        /// <summary>Unity CLI entry point used after the first successful compile.</summary>
        public static void ConfigureInputSystem()
        {
            PlayerSettings settings = Resources.FindObjectsOfTypeAll<PlayerSettings>().FirstOrDefault();
            if (settings == null)
            {
                throw new InvalidOperationException("Shadow Doors: PlayerSettings object was not loaded.");
            }

            var serializedSettings = new SerializedObject(settings);
            SerializedProperty activeInputHandler = serializedSettings.FindProperty(ActiveInputHandlerProperty);
            if (activeInputHandler == null)
            {
                throw new InvalidOperationException(
                    "Shadow Doors: Unity did not expose PlayerSettings.activeInputHandler.");
            }

            activeInputHandler.intValue = InputSystemOnly;
            if (!serializedSettings.ApplyModifiedPropertiesWithoutUndo())
            {
                throw new InvalidOperationException(
                    "Shadow Doors: failed to persist Input System-only handling.");
            }

            AssetDatabase.SaveAssets();
            Debug.Log("SHADOW_DOORS_CONFIG activeInputHandler=" + activeInputHandler.intValue);
        }
    }
}
