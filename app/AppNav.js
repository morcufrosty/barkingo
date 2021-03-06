import { createStackNavigator, createAppContainer, createBottomTabNavigator } from 'react-navigation';
import Register from "./Components/register";
import Login from "./Components/login"
import swipeScreen from "./Components/swipeScreen"
import Ionicons from 'react-native-vector-icons/Ionicons';
//import AppAfterLogin from "./AppAfterLogin"
import React, { Component } from 'react';
import Icon from 'react-native-vector-icons/FontAwesome';
import Settings from "./Components/settings";
import Chat from "./Components/chat"
import perfilAnimalSwipe from "./Components/perfilAnimalSwipe"
import perfilAnimalMyOffers from "./Components/perfilAnimalMyOffers"
import perfilAnimalFavorites from "./Components/perfilAnimalFavorites"
import formNewOffer from "./Components/formNewOffer"
import TabIcon from './TabIcon';
import AutocompleteExample from "./Components/autocomplete"
import Filter from "./Components/filter"
import formPerfilUsuari from "./Components/formPerfilUsuari"
import chatScreen from "./Components/conversationChat"
import changeSettings from "./Components/changeSettings"
import chatDirectory from "./Components/chatDirectory"



const SettingsNavigator = createStackNavigator({
    LoginScreen: { screen: Login },
    SettingsScreen: { screen: Settings },
    Filter: {screen: Filter},
    changeSettings: {screen: changeSettings},
    perfilAnimalMyOffers: {screen: perfilAnimalMyOffers},
    formNewOffer: { screen: formNewOffer},
    formPerfilUsuari:{screen: formPerfilUsuari}},
    {
        initialRouteName: 'SettingsScreen',
        headerMode: 'none',
        navigationOptions: {
            headerVisible: false,
        }

    });

const SettingsNav = createAppContainer(SettingsNavigator);



const perfilAnimalFavoritesa = createStackNavigator({
    perfilAnimalFavorites: {screen: perfilAnimalFavorites},
    chatScreen: {screen: chatScreen}
},
{
    headerMode: 'none',
    navigationOptions: {
        headerVisible: false,
    }
});

const perfilAnimalFavoritesNav = createAppContainer(perfilAnimalFavoritesa);

const SwipeNavigator = createStackNavigator({

    SwipeScreen: { screen: swipeScreen },
    Filter: {screen: Filter},

    perfilAnimalSwipe: { screen: perfilAnimalSwipe }
},
    {
        initialRouteName: 'SwipeScreen',
        headerMode: 'none',
        navigationOptions: {
            headerVisible: false,
        }

    });

    const ChatNavigator = createStackNavigator({
        Chat: { screen: Chat },
        perfilAnimalFavorites: { screen: perfilAnimalFavoritesNav },



    },
        {
            initialRouteName: 'Chat',
            headerMode: 'none',
            navigationOptions: {
                headerVisible: false,
            }

        });

    const ChatNav = createAppContainer(ChatNavigator);


    const chatDir = createStackNavigator({
        chatDirectory: { screen: chatDirectory },
        chatScreen: { screen: chatScreen },



    },
        {
            initialRouteName: 'chatDirectory',
            headerMode: 'none',
            navigationOptions: {
                headerVisible: false,
            }

        });

    const ChatDir = createAppContainer(chatDir);




const SwipeNav = createAppContainer(SwipeNavigator);

const TabNavigator = createBottomTabNavigator(
    {
        Swipe: {
            screen: SwipeNav,
            navigationOptions: {
                tabBarLabel: "",
                tabBarIcon: ({ focused, tintColor }) => (
                    <TabIcon
                        iconDefault='paw'
                        iconFocused='paw'
                        focused={focused}
                        tintColor={tintColor}
                    />
                )
            },
        },
        Settings: {
            screen: SettingsNav,
            navigationOptions: {
                tabBarLabel: "",
                tabBarIcon: ({ focused, tintColor }) => (
                    <TabIcon
                        iconDefault='user'
                        iconFocused='user'
                        focused={focused}
                        tintColor={tintColor}
                    />
                )
            },
        },

        chat: {
            screen: ChatNav,
            navigationOptions: {
                tabBarLabel: "",
                tabBarIcon: ({ focused, tintColor }) => (
                    <TabIcon
                        iconDefault='heart'
                        iconFocused='heart'
                        focused={focused}
                        tintColor={tintColor}
                    />)
            },
        },
        chatDirectory: {
            screen: ChatDir,
            navigationOptions: {
                tabBarLabel: "",
                tabBarIcon: ({ focused, tintColor }) => (
                    <TabIcon
                        iconDefault='comment'
                        iconFocused='comment'
                        focused={focused}
                        tintColor={tintColor}
                    />)
            },
        },





    },

    {
        tabBarOptions: {
            showLabel: false,
            showIcon: true,
            activeTintColor: "#F15A24",
            inactiveTintColor: "#858585",
        },

    }
);

const BottomNavigation = createAppContainer(TabNavigator);

const newProfileFormScreen = createStackNavigator({
    BottomNavigation: { screen: BottomNavigation },
    formPerfilUsuari: { screen: formPerfilUsuari}
  },
    {
        initialRouteName: 'formPerfilUsuari',
        headerMode: 'none',
        navigationOptions: {
            headerVisible: false,
        }

    });

const newProfileFormScreenNav = createAppContainer(newProfileFormScreen);

const MainNavigator = createStackNavigator({
    Register: { screen: Register },
    Login: { screen: Login },
    AppAfterLogin: { screen: BottomNavigation },
    newProfileFormScreen:{screen: newProfileFormScreenNav}
},
    {
        initialRouteName: 'Login',
        headerMode: 'none',
        navigationOptions: {
            headerVisible: false,
        }
    });

const AppNav = createAppContainer(MainNavigator);

export default AppNav;
