<script setup lang="ts">
    import { defineComponent } from 'vue';
    import Main from './components/Main.vue';

    defineComponent({
      name: 'App',
      components: {
        Main
      }
    });
</script>

<template>
    <Main msg="Welcome to Your Vue.js + TypeScript App"/>
</template>

<style>
    html {
        background-color: #1e1e1e;
    }
</style>
