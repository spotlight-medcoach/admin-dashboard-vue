<template>
	<header class="head-navigation">
		<img src="../../assets/images/logo.svg" alt="">

		<nav class="nav">
			<div>
				<LinkNavigation
					to="/spotlightersPages/requestedQuestions"
					new_class="link nuxt-link-active"
					icon="fas fa-file-medical"
					title="Casos solicitados" />
			</div>
			<div>
				<LinkNavigation 
					to="/spotlightersPages/casesWithFeedback"
					new_class="link nuxt-link-active"
					icon="fas fa-folder"
					title="Correcciones" />
			</div>
			<div>
				<LinkNavigation 
					to="/spotlightersPages/myCases"
					new_class="link nuxt-link-active"
					icon="fas fa-list-alt"
					title="Mis casos" />
			</div>
			
		</nav>
			<!-- <p>Preguntas del periodo actual</p> -->
		<!-- <div class="profile">
			<OptionsModal :show="showModal" @close="showModal = false" />
			<button class="fas fa-bars btn" @click="showModal = true"></button>
		</div> -->

		<div class="profile">
			<!-- Default dropleft button -->
			<div class="btn-group dropleft">
				<button type="button" class="btn outfocus" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false"><i class="fas fa-bars"></i></button>

				<div class="dropdown-menu">
					<!-- Dropdown menu links -->
					<button class="btn" @click="profile"><i class="fas fa-user-alt mr-2"></i> Perfil</button>
					<button class="btn" @click="logout"><i class="fas fa-sign-in-alt mr-2"></i> Cerrar sesión</button>
				</div>
			</div>
		</div>

	</header>
</template>

<script>
import LinkNavigation from '../LinkNavigation';
import OptionsModal from '../modals/OptionsModal';

export default {
	components: {
		LinkNavigation,
		OptionsModal
	},
	data() {
		return {
			showModal: false
		}
	},
	methods: {
		profile() {
            if (process.browser) {
            // this.$axios.defaults.headers.common['Authorization'] = `Bearer ${localStorage.getItem('user_token')}`
                this.userData = JSON.parse(localStorage.getItem('user'));
            }
            console.log(this.userData.role)
            if (this.userData.role == 'Administrador') {
                this.$router.push({ path: '/administratorsPages/profile' });
            } else {
                this.$router.push({ path: '/spotlightersPages/profile' });
            }
        },
        logout() {
            setTimeout(() => {
                this.$router.push({ path: '/' });

                this.$store.dispatch('killSession')
                localStorage.clear();
            }, 1000)
        }
	}
}
</script>

<style scoped>
	.head-navigation {
		display: flex;
		flex-direction: row;
		align-items: center;
		width: 100%;
		height: 60px;
		background: #FFF;
		border-bottom: 1px solid #D4D5D7;
    }

    .head-navigation img {
		width: 220.11px;
		height: 28px;
		margin-left: 40px;
    }

    .profile {
		margin-left: auto;
		margin-right: 3%;
    }

	.profile i {
		font-size: 36px;
	}

	.dropdown-menu {
		font-family: Montserrat;
		width: 175px;
		margin: 30px 0px;
        background-color: #fff;
        border-radius: 2px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, .33);
        box-shadow: 0px 0px 20px #D4D5D7;
        border-radius: 10px;
	}

	.dropdown-menu i {
		font-size: 18px;
	}

	.nav {
		display: flex;
		flex-direction: row;
		margin-left: 7%;
		margin: 0px 3%;
	}

	.nav div {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 8vw;
	}

	.nuxt-link-exact-active {
        color:#fff;
        background-color:#FF9300;
        border-color: #FF9300;
    }

	.options {
		display: flex;
		align-items: flex-end;
		justify-content: flex-end;
		background: red;
		/* top: 5%; */
	}
</style>