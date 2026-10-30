# Cuenta Gomería

Calculadora adaptable a celulares, sin dependencias ni servicios externos. Guarda movimientos en el almacenamiento local del navegador.

## Ejecutar

Desde `/workspace/gomeriacuenta`:

```sh
python3 -m http.server 8000 --bind 0.0.0.0
```

Se puede publicar como sitio estático en un servidor HTTPS. Los datos son propios de cada navegador y no se sincronizan ni tienen respaldo remoto.

## Validar

```sh
node --test calculations.test.mjs
```

Los importes se calculan en centavos. Los arreglos se reparten 70/30; cada cámara aporta $3.000 al del 30%, sin aplicar otro porcentaje; las cubiertas no generan comisión. Todas las transferencias las recibe la otra parte. El cierre indica el pago total en efectivo y cualquier faltante de caja.
