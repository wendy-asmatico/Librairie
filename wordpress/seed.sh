#!/usr/bin/env bash
# Remplit le WordPress local avec des données de démonstration
# (livres de la maquette, clients, commandes sur 60 jours).
set -euo pipefail
cd "$(dirname "$0")"
docker compose --progress quiet run --rm -v "$PWD/seed:/seed:ro" cli wp eval-file /seed/seed.php
