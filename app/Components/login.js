import React, { Component } from 'react';
import {
    StyleSheet, Text, View,
    ScrollView,
    TextInput,
    Alert,
    ToastAndroid,
    Platform
} from 'react-native';
import Button from './Button';
import { LinearGradient } from 'expo'
import { Facebook } from 'expo';
import TextInputWTitle from './inputText.js';
import InputPassword from './inputPassword.js';
import { AsyncStorage } from 'react-native';
import * as Expo from "expo"
//import { getMaxListeners } from 'cluster';
import { StackActions, NavigationActions } from 'react-navigation';
import strings from '../i18n/i18n';
import {setLocal} from '../i18n/i18n';
import {ChangeLanguage} from '../i18n/i18n';



const ACCESS_TOKEN = 'access_token';

export default class App extends React.Component {

    constructor(props) {
        super(props)
        this.state = {
            email: '',
            name: '',
            password: '',
            count: 0,
            token: '',
            isLoading: true

        }
    }

    resetState() {
        this.setState({
            name: '',
            email: '',
            token: '',
            password: ''
        })
    }

    async signInWithGoogle() {
        try {
            const result = await Expo.Google.logInAsync({
                androidClientId:
                    "802116894984-a2n57c60e6ri7bpp6t63nlivelj185om.apps.googleusercontent.com",
                //iosClientId: YOUR_CLIENT_ID_HERE,  <-- if you use iOS
                scopes: ["profile", "email"]
            })

            if (result.type === "success") {
                this.setState({
                    name: result.user.name,
                    email: result.user.email.replace(/\s/g, "_"),
                    token: result.accessToken

                    // maybe we need it:photoUrl: result.user.photoUrl,
                })
                console.log("enter fetch API barkingo google");

                const resFromBarkingo = await this.renewGoogleTokenToAPI('http://10.4.41.164/api/users/renewGoogleToken');
                console.log("google response content:" + resFromBarkingo.success + " " + resFromBarkingo.msg);
                if (resFromBarkingo.success) {
                    this.storeToken(resFromBarkingo.token);
                    var profile = await this.checkIfUserHasProfile(resFromBarkingo.token);
                    if(profile){
                      console.log("USUARI AMB PERFIL");
                    }else{
                      console.log("USUARI SENSE PERFIL");

                    }
                    this.resetState();
                    const resetAction = StackActions.reset({
                        index: 0,
                        actions: [NavigationActions.navigate({ routeName: 'AppAfterLogin' })],
                    });
                    this.props.navigation.dispatch(resetAction);
                }

            } else {
                console.log("cancelled Google Login")
            }
        } catch (e) {
            console.log("error", e)
        }
    }

    retrieveAndCheckToken = async () => {
        try {
            const token = await AsyncStorage.getItem(ACCESS_TOKEN);
            if (token !== null) {
                tokenJson = JSON.parse(token);

                /*
                console.log("This is the token: " + tokenJson.token);
                console.log("This is when the token expires: " + new Date(tokenJson.expiration));
                console.log("This is the current time: " + new Date(new Date().getTime()));
                */

                if (new Date().getTime() < tokenJson.expiration) {
                    this.resetState();
                    this.setState({
                        isLoading: false
                    });
                    const resetAction = StackActions.reset({
                        index: 0,
                        actions: [NavigationActions.navigate({ routeName: 'AppAfterLogin' })],
                    });
                    this.props.navigation.dispatch(resetAction);
                }
                else {
                    //Renew token
                    this.setState({
                        isLoading: false
                    });
                }
            } else {
                console.log("No local token");
                this.setState({
                    isLoading: false
                });

            }
        } catch (error) {
            console.log(error);
        }
    };

    storeToken = async (token) => {
        try {
            expirationDate = new Date().getTime() + (24 * 60 * 60) * 1000;
            jsonObject = { token: token, expiration: expirationDate };
            await AsyncStorage.setItem(ACCESS_TOKEN, JSON.stringify(jsonObject));
        } catch (error) {
            console.log("Ha fallat el storeToken: " + error)
            // Error saving data
        }
    }

    async removeToken() {
        try {
            await AsyncStorage.removeItem(ACCESS_TOKEN);
        } catch (error) {
            // Error showing data
            console.log("Ha fallat el removeToken: " + error)
        }
    }

    async checkIfUserHasProfile(jsonToken) {
      console.log("TOKEN1 " + jsonToken)
      const responseCurrentUser = await this.getCurrentUserFromAPI(jsonToken);
      console.log(responseCurrentUser);
      if (responseCurrentUser.user.latitude === null){
        return false;
      }
      return true;

    }

    async getCurrentUserFromAPI(tokenJson) {
        console.log(tokenJson);

        return fetch('http://10.4.41.164/api/users/currentUser', {
            method: 'GET',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
                'x-access-token': tokenJson
            }
        }).then((response) => response.json())
            .then((responseJson) => {
                return responseJson;
            }).catch((error) => {
                console.error(error);
            });

    }

    async renewFacebookTokenToAPI(facebookName, facebookEmail, facebookToken) {

        return fetch('http://10.4.41.164/api/users/renewFacebookToken', {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                name: facebookName.replace(/\s/g, "_"),
                email: facebookEmail,
                token: facebookToken
            }),
        }).then((response) => response.json())
            .then((responseJson) => {
                console.log(responseJson.msg);
                return responseJson;
            }).catch((error) => {
                console.error(error);
            });
    }

    async renewGoogleTokenToAPI(fullRoute) {
        console.log('enter renew google token');
        console.log("fullRoute: " + fullRoute);
        return fetch(fullRoute, {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                name: this.state.name,
                email: this.state.email,
                token: this.state.token
            }),
        }).then((response) => response.json())
            .then((responseJson) => {
                console.log(responseJson.msg);
                return responseJson;
            }).catch((error) => {
                console.error(error);
            });
    }

    async logInFacebook() {
        try {
            const {
                type,
                token,
                expires,
                permissions,
                declinedPermissions,
            } = await Facebook.logInWithReadPermissionsAsync('248948239393282', {
                permissions: ['public_profile', 'email'],
            });
            if (type === 'success') {

                const responseFb = await fetch(`https://graph.facebook.com/me?fields=name,picture,email&access_token=${token}`);
                responseFbJson = await responseFb.json();

                const responseBarkingo = await this.renewFacebookTokenToAPI(responseFbJson.name, responseFbJson.email, token);
                if (responseBarkingo.success) {
                    this.storeToken(responseBarkingo.token);
                    var profile = await this.checkIfUserHasProfile(resFromBarkingo.token);
                    if(profile){
                      console.log("USUARI AMB PERFIL");
                      const resetAction = StackActions.reset({
                          index: 0,
                          actions: [NavigationActions.navigate({ routeName: 'AppAfterLogin' })],
                      });
                      this.props.navigation.dispatch(resetAction);
                    }else{
                      console.log("USUARI SENSE PERFIL");
                      const resetAction = StackActions.reset({
                          index: 0,
                          actions: [NavigationActions.navigate(   'newProfileFormScreen' , {new: true} )],
                      });
                      this.props.navigation.dispatch(resetAction);
                    }

                }
                else Alert.Alert(strings('login.loginError'), responseBarkingo.msg);

                //Alert.alert("You are logged in!", `Hi ${responseFb.json().name}!`);
            } else {
                // type === 'cancel'
            }
        } catch ({ message }) {
            alert(strings(login.faceError, {m: message}));
        }
    }

    async loginUsingAPI() {

        return fetch('http://10.4.41.164/api/users/login', {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: this.state.email,
                password: this.state.password
            }),
        }).then((response) => response.json())
            .then((responseJson) => {
                console.log(responseJson.msg);
                return responseJson;
            }).catch((error) => {
                console.error(error);
            });
    }

    async loginDevUsingAPI() {

        return fetch('http://10.4.41.164/api/users/login', {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: 'devUser@dev.dev',
                password: 'devUser'
            }),
        }).then((response) => response.json())
            .then((responseJson) => {
                console.log(responseJson.msg);
                return responseJson;
            }).catch((error) => {
                console.error(error);
            });
    }

    handlePressFBLogin() {
        this.logInFacebook();
    }

    pressGoogleLogin() {
        this.signInWithGoogle()
    }

    async handleLoginButton() {

        if (this.state.email === '' && this.state.password === '') {
            this.setState({ count: this.state.count + 1 });
            if (this.state.count === 1) {
                ToastAndroid.showWithGravityAndOffset(
                    'Assegura\'t d\'estar conenctat a la VPN',
                    ToastAndroid.SHORT,
                    ToastAndroid.BOTTOM,
                    25,
                    50,
                );
            }


        }
        else if (this.state.email == '') {
            Alert.alert(string(login.error), string(login.enterEmail));
            return;
        }


        else if (this.state.password == '') {
            Alert.alert(string(login.error), string(login.enterPassword));
            return;
        }

        const response = await this.loginUsingAPI();
        console.log(response.msg);
        if (response.success) {
            console.log(response.token);
            var profile = await this.checkIfUserHasProfile(response.token);
            if(profile){
              console.log("USUARI AMB PERFIL");
              this.storeToken(response.token);
              this.resetState();
              const resetAction = StackActions.reset({
                  index: 0,
                  actions: [NavigationActions.navigate({ routeName: 'AppAfterLogin' })],
              });
              this.props.navigation.dispatch(resetAction);
            }else{
              console.log("USUARI SENSE PERFIL");
              this.storeToken(response.token);
              this.resetState();
              const resetAction = StackActions.reset({
                  index: 0,
                  actions: [NavigationActions.navigate( {routeName: 'newProfileFormScreen',params: {new: true} } )],
              });
              this.props.navigation.dispatch(resetAction);

            }

        }
        else {
            if (response.msg === undefined)
                Alert.alert(strings('login.loginError'), strings.apply('login.serverError'));
            else
                Alert.alert(strings('login.loginError'), response.msg);
        }
    }


    async handleLanguage(){

        lang = await AsyncStorage.getItem("lang");
            if(lang != null){
                ChangeLanguage(lang);
            }
    }

    render() {

        if (this.state.isLoading) {
            this.handleLanguage();
            this.retrieveAndCheckToken();
            //setLocal();
            
            return <LinearGradient colors={['#F15A24', '#D4145A']}
                start={[0, 1]}
                end={[1, 0]}
                style={{
                    flex: 1,
                    padding: '10%',
                    paddingTop: '30%'
                }}>

            </LinearGradient>;
        }
        return (
            <LinearGradient colors={['#F15A24', '#D4145A']}
                start={[0, 1]}
                end={[1, 0]}
                style={{
                    flex: 1,
                    padding: '10%',
                    paddingTop: '30%'
                }}>
                <Text style={{ color: 'white', fontSize: 45, flex: 1 }}>{strings('login.loginText')}</Text>

                <View style={{ flex: 1 }}>
                    <Text style={{ color: 'white' }}>{strings('login.email')}</Text>
                    <TextInput onChangeText={(email) => this.setState({ email })} value={this.state.email} textAlign={'center'} autoCapitalize={'none'}
                        style={{ backgroundColor: 'white', opacity: 0.5, borderRadius: 5, paddingVertical: 0, height: 35 }}></TextInput>
                </View>

                <View style={{ flex: 1 }}>
                    <Text style={{ color: 'white' }}>{strings('login.password')}</Text>
                    <TextInput secureTextEntry={true} onChangeText={(password) => this.setState({ password })} value={this.state.password} textAlign={'center'} autoCapitalize={'none'}
                        style={{ backgroundColor: 'white', opacity: 0.5, borderRadius: 5, paddingVertical: 0, height: 35 }}></TextInput>
                </View>

                <View style={{ flex: 1 }}>
                    <Button
                        title={strings('login.loginText')}
                        color='#ff3b28'
                        onPress={async () => this.handleLoginButton()}>
                    </Button>
                </View>

                <View style={{ flex: 1 }}>
                    <Text style={{ color: 'white' }}> {strings('login.noAccount')}<Text> </Text>
                        <Text style={{ textDecorationLine: "underline" }}
                            onPress={() => this.props.navigation.navigate('Register')
                            }>
                            {strings('login.register')}
            </Text>
                    </Text>
                    <View style={{ flex: 1, padding: '11%', marginTop: 20 }}>
                        <Button
                            title={strings('login.loginFace')}
                            color='#3b5998'
                            onPress={() => this.handlePressFBLogin()}
                        ></Button>
                    </View>
                    <View style={{ flex: 1, padding: '11%' }}>
                        <Button
                            title={strings('login.loginGoogle')}
                            color='#D84B37'
                            onPress={() => this.pressGoogleLogin()}
                        ></Button>
                    </View>
                </View>
            </LinearGradient>
        );
    }
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
    },
});
