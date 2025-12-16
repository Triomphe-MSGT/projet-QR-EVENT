#!/bin/bash

# Script pour générer l'APK de QR Event
# Ce script vérifie les prérequis et génère l'APK

set -e  # Arrêter en cas d'erreur

echo "🚀 Script de génération d'APK pour QR Event"
echo "============================================"
echo ""

# Couleurs pour les messages
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Fonction pour vérifier si une commande existe
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# 1. Vérifier Java
echo "📋 Vérification des prérequis..."
echo ""

if command_exists java; then
    JAVA_VERSION=$(java -version 2>&1 | awk -F '"' '/version/ {print $2}')
    echo -e "${GREEN}✓${NC} Java est installé (version: $JAVA_VERSION)"
else
    echo -e "${RED}✗${NC} Java n'est pas installé"
    echo ""
    echo "Pour installer Java JDK 17, exécutez :"
    echo "  sudo apt update"
    echo "  sudo apt install openjdk-17-jdk"
    echo ""
    echo "Puis configurez JAVA_HOME dans ~/.bashrc :"
    echo "  export JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64"
    echo "  export PATH=\$PATH:\$JAVA_HOME/bin"
    echo ""
    exit 1
fi

# 2. Vérifier JAVA_HOME
if [ -z "$JAVA_HOME" ]; then
    echo -e "${YELLOW}⚠${NC} JAVA_HOME n'est pas défini"
    echo "Tentative de détection automatique..."
    
    # Essayer de détecter JAVA_HOME
    if [ -d "/usr/lib/jvm/java-17-openjdk-amd64" ]; then
        export JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64
        echo -e "${GREEN}✓${NC} JAVA_HOME défini sur: $JAVA_HOME"
    elif [ -d "/usr/lib/jvm/default-java" ]; then
        export JAVA_HOME=/usr/lib/jvm/default-java
        echo -e "${GREEN}✓${NC} JAVA_HOME défini sur: $JAVA_HOME"
    else
        echo -e "${RED}✗${NC} Impossible de détecter JAVA_HOME automatiquement"
        exit 1
    fi
else
    echo -e "${GREEN}✓${NC} JAVA_HOME est défini: $JAVA_HOME"
fi

echo ""
echo "🔨 Étape 1/3 : Build de l'application React..."
npm run build

echo ""
echo "🔄 Étape 2/3 : Synchronisation avec Android..."
npm run cap:sync

echo ""
echo "📦 Étape 3/3 : Génération de l'APK..."
cd android

# Vérifier si gradlew existe et est exécutable
if [ ! -x "./gradlew" ]; then
    chmod +x ./gradlew
fi

# Générer l'APK de debug
./gradlew assembleDebug

cd ..

echo ""
echo -e "${GREEN}✅ APK généré avec succès !${NC}"
echo ""
echo "📱 L'APK se trouve ici :"
echo "   android/app/build/outputs/apk/debug/app-debug.apk"
echo ""
echo "Pour installer l'APK sur votre appareil Android :"
echo "1. Activez 'Sources inconnues' dans les paramètres de sécurité"
echo "2. Transférez le fichier APK sur votre appareil"
echo "3. Ouvrez le fichier APK pour l'installer"
echo ""
echo "Ou utilisez ADB si votre appareil est connecté :"
echo "   adb install android/app/build/outputs/apk/debug/app-debug.apk"
echo ""
