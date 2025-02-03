<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
import { ref } from 'vue'

const showPieChart = ref(false)
</script>

<template>
	<header>
		<div class="wrapper">
			<nav>
				<RouterLink to="/">主頁</RouterLink>
			</nav>
		</div>
	</header>
	<div class="show_view_area">
		<RouterView />
	</div>
</template>

<style scoped>
.wrapper {
	margin: 10px 0;
	& > nav {
		display: flex;
		justify-content: center;
		& > a {
			padding: 10px;
		}
	}
}
.show_view_area {
	display: flex;
	/* .expense_nav {
		flex: 1;
	} */
	/* .expense_show {
		flex: 1;
	} */
}
</style>
