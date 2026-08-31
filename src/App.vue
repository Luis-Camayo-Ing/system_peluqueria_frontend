<template>
  <VApp>
    <a class="skip-link" href="#main-content">Ir al contenido principal</a>
    <RouterView />
  </VApp>
</template>

<style>
.skip-link {
  position: fixed;
  z-index: 10000;
  top: 8px;
  left: 8px;
  padding: 10px 14px;
  color: #ffffff;
  background: #17324d;
  border-radius: 8px;
  transform: translateY(-150%);
}

.skip-link:focus {
  transform: translateY(0);
}
</style>
