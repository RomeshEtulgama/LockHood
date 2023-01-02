<template>
    <v-row align="center" justify="center">
        <v-col cols="12" sm="10">
            <v-card class="elevation-6 mt-10">
                <v-window v-model="step">
                    <!-- Login -->
                    <v-window-item :value="1">
                        <v-row>
                            <v-col cols="12" md="6">
                                <v-card-text class="mt-12">
                                    <h4 class="text-center">Login in to Your Account</h4>
                                    <h6 class="text-center  grey--text ">Welcome to LockHood!</h6>
                                    <v-row align="center" justify="center">
                                        <v-col cols="12" sm="8">

                                            <v-text-field label="Email" outlined dense color="blue" autocomplete="false"
                                                class="mt-16" v-model="email" />
                                            <v-text-field label="Password" outlined dense color="blue"
                                                autocomplete="false" type="password" v-model="password" />
                                            <v-row>
                                                <!-- <v-col cols="12" sm="7">
                                                    <v-checkbox label="Remember Me" class="mt-n1" color="blue">
                                                    </v-checkbox>
                                                </v-col> -->
                                                <v-col cols="12" sm="5">
                                                    <span class="caption blue--text">Forgot password</span>
                                                </v-col>
                                            </v-row>
                                            <v-btn color="blue" dark block tile @click="login">Log in</v-btn>

                                            <v-snackbar v-model="showError" :timeout="timeout" color="red accent-2">
                                                {{ errorMessage }}

                                                <template v-slot:action="{ attrs }">
                                                    <v-btn text v-bind="attrs" @click="showError = false">
                                                        Close
                                                    </v-btn>
                                                </template>
                                            </v-snackbar>

                                            <h5 class="text-center grey--text mt-4 mb-3">Or </h5>
                                            <div class="d-flex justify-center">
                                                <v-btn tile outlined color="primary" dark @click="signInWithGoogle">
                                                    Sign in with Google
                                                </v-btn>
                                            </div>
                                        </v-col>
                                    </v-row>
                                </v-card-text>
                            </v-col>
                            <v-col cols="12" md="6" class="blue rounded-bl-xl">
                                <div style="  text-align: center; padding: 180px 0;">
                                    <v-card-text class="white--text">
                                        <h3 class="text-center ">Don't Have an Account Yet?</h3>
                                        <h6 class="text-center">Let's get you all set up so you can start your
                                            first<br> onboarding experience</h6>
                                    </v-card-text>
                                    <div class="text-center">
                                        <v-btn tile outlined dark @click="step++">SIGN UP</v-btn>
                                    </div>
                                </div>
                            </v-col>
                        </v-row>
                    </v-window-item>
                    <!-- Signup -->
                    <v-window-item :value="2">
                        <v-row>
                            <v-col cols="12" md="6" class="blue rounded-br-xl">
                                <div style="  text-align: center; padding: 180px 0;">
                                    <v-card-text class="white--text">
                                        <h3 class="text-center ">Alredy Signed up?</h3>
                                        <h6 class="text-center">Let's get you all set up so you can start your
                                            first<br> onboarding experience</h6>
                                    </v-card-text>
                                    <div class="text-center">
                                        <v-btn tile outlined dark @click="step--">Log in</v-btn>
                                    </div>
                                </div>
                            </v-col>

                            <v-col cols="12" md="6">
                                <v-card-text class="mt-12">
                                    <h4 class="text-center">Sign Up for an Account</h4>
                                    <h6 class="text-center  grey--text ">Let's request your login approval <br>
                                        from the administrator</h6>
                                    <v-row align="center" justify="center">
                                        <v-col cols="12" sm="8">
                                            <v-row>
                                                <v-col cols="12" sm="6">
                                                    <v-text-field label="First Name" outlined dense color="blue"
                                                        class="mt-4" v-model="first_name" required
                                                        :error-messages="firstNameError ? [firstNameError] : []"
                                                        @input="resetError('firstName')" />
                                                </v-col>
                                                <v-col cols="12" sm="6">
                                                    <v-text-field label="Last Name" outlined dense color="blue"
                                                        class="mt-4" v-model="last_name" required
                                                        :error-messages="lastNameError ? [lastNameError] : []"
                                                        @input="resetError('lastName')" />
                                                </v-col>
                                            </v-row>
                                            <v-text-field label="Email" outlined dense color="blue" v-model="email"
                                                required :error-messages="emailError ? [emailError] : []"
                                                @input="resetError('email')" />
                                            <v-text-field label="Password" outlined dense color="blue"
                                                autocomplete="false" type="password" v-model="password" required
                                                :error-messages="passwordError ? [passwordError] : []"
                                                @input="resetError('password')" />

                                            <v-btn color="blue" dark block tile @click="signup">Sign up</v-btn>

                                            <h5 class="text-center grey--text mt-4 mb-3">Or </h5>
                                            <div class="d-flex justify-center">
                                                <v-btn tile outlined color="primary" dark @click="signInWithGoogle">
                                                    Sign in with Google
                                                </v-btn>
                                            </div>
                                        </v-col>
                                    </v-row>
                                </v-card-text>
                            </v-col>
                        </v-row>
                    </v-window-item>
                </v-window>
            </v-card>
        </v-col>
    </v-row>
</template>
<script>
import * as fb from '@/firebase'
import {
    getAuth, signInWithPopup, GoogleAuthProvider, createUserWithEmailAndPassword, signInWithEmailAndPassword
} from "firebase/auth";

export default {
    name: 'Login',

    data: () => ({
        step: 1,
        first_name: '',
        last_name: '',
        email: '',
        password: '',

        errorMessage: '',
        showError: false,
        timeout: 3000,

        firstNameError: '',
        lastNameError: '',
        emailError: '',
        passwordError: ''


    }),

    methods: {
        resetError(field) {
            this[`${field}Error`] = ''
        },

        async login() {
            signInWithEmailAndPassword(fb.auth, this.email, this.password)
                .then(() => {
                    console.log("Login successful!")
                })
                .catch((error) => {
                    const errorCode = error.code;
                    console.log(errorCode)
                    this.errorMessage = "User not found, please check the email and password"
                    this.showError = true;
                });
        },

        validateSignup() {
            if (!this.first_name) {
                this.firstNameError = 'First name is required'
                return false;
            }
            if (!this.last_name) {
                this.lastNameError = 'Last name is required'
                return false;
            }
            if (!this.email) {
                this.emailError = 'Email is required'
                return false;
            }

            const emailRegex = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/

            if (!emailRegex.test(this.email)) {
                this.emailError = 'Please enter a valid email address'
                return false;
            }

            const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*+])(?=.{8,})/

            if (!passwordRegex.test(this.password)) {
                this.passwordError = 'Invalid Password'
                return false;
            }

            return true

        },

        async signup() {

            const auth = getAuth();

            const user_exists = await fb.userExists(this.email)

            if (this.validateSignup() && !user_exists) {
                createUserWithEmailAndPassword(auth, this.email, this.password)
                    .then(async (userCredential) => {
                        console.log("Signup successful!")
                        const user = userCredential.user;
                        await fb.addUser(user.uid, user.email, this.first_name + " " + this.last_name)
                    })
                    .catch((error) => {
                        const errorCode = error.code;
                        const errorMessage = error.message;
                        console.log(errorCode, errorMessage)
                    });
            } else if (user_exists) {
                this.errorMessage = "User exists, please login!";
                this.step = 1
                this.showError = true;
            }
        },

        async signInWithGoogle() {
            const provider = new GoogleAuthProvider();
            signInWithPopup(fb.auth, provider)
                .then(async (userCredential) => {
                    console.log("Signup successful!")
                    const user = userCredential.user;
                    const user_exists = await fb.userExists(user.email)
                    if (!user_exists)
                        await fb.addUser(user.uid, user.email, user.displayName)
                }).catch((error) => {
                    // Handle Errors here.
                    const errorCode = error.code;
                    const errorMessage = error.message;
                    // The email of the user's account used.
                    // const email = error.customData.email;
                    // The AuthCredential type that was used.
                    const credential = GoogleAuthProvider.credentialFromError(error);
                    console.log(errorCode, errorMessage, credential)
                });


        },
    }

}
</script>

<style scoped>
.v-application .rounded-bl-xl {
    border-bottom-left-radius: 300px !important;
}

.v-application .rounded-br-xl {
    border-bottom-right-radius: 300px !important;
}
</style>