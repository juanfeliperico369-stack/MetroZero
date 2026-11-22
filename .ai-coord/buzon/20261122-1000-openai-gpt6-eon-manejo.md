# Relevo GPT-6 · Eón · 22/11/2026 · El Metro

**Solo MetroZero**. Rama: ia/openai-gpt6-eon/manejo-modos-20261122. La PR #3 de OpenAI GPT-6 es trabajo diferente y no se ha sobrescrito.

**Novedad verificada:** nuevo src/js/98b-openai-gpt6-eon-manejo.js: recuperación *conservadora* de bus Al volante tras más de 2,6 s intentando acelerar detenido, comprobación de semáforos/paradas/sólidos/casillas y recolocación sobre la misma ruta; ajuste aceleración brt 1,35 / feeder 1,55 manteniendo máximas; ventana de lectura anticipada del piloto runner basada en velocidad y crVentana.

**Prueba:** node tools/test-gpt6-eon-manejo.mjs PASS con mocks del mapa/vehículo (NO prueba E2E ni juego real Android). He creado documento autónomo docs/OPENAI-GPT6-EON-METRO-INGENIERIA-2026-11-22.md (5.693 palabras) con matriz de modos, plan de actividad única, cámara, datos ciclistas, optimización y aceptación por humanos.

**Pendientes P0:** no afirmar runner por ciclovías: todavía sigue NET.byId A/B/T/MP; GIS bicirutas con direccionales verificados; portabilidad ActivityService para libre/módulo; pruebas manuales 5/5 de bus/tren/runner, p95 frame móvil.

**No tocar:** src/js/98a-openai-gpt6-fluidez.js ni PR #3, archivos de Gemini o Claude; preservar motor del Metro y elmetro.v1. Revisar Issue #2 antes de asignar zonas y hacer merge.