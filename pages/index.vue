<template>
	<div>
		<LoginNav />
		<Login />
		<!-- <Navigation /> -->
		<!-- Estas dos cosas son necesarias para el modal -->
		<!-- <button @click="toggleModal" class="btn btn-danger">Modal</button>
		<ModalConfirm v-if="isShowModal" @close="toggleModal" /> -->
		
	</div>
</template>

<script>
import LoginNav from '../components/navs/LoginNav';
import Login from '../components/Login';
// import Navigation from '../components/Navigation';
// import ModalConfirm from '../components/ModalConfirm';

export default {
	components: {
		LoginNav,
		Login,
		// Navigation,
		// ModalConfirm
	},
	// data() y mmethods necesarios para el modal
	// data() {
	// 	return {
	// 		isShowModal: false
	// 	}
	// },
	// methods: {
		// toggleModal() {
			// this.isShowModal = !this.isShowModal;
			// console.log('yes')
		// }
	// }
}
</script>

<style scoped>
	/* .modal-overlay {
		position: absolute;
		top: 0;
		left: 0;
		bottom: 0;
		right: 0;
		z-index: 100;
		background: rgba(0, 0, 0, 0.4);
	} */

</style>
