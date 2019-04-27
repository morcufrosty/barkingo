import React, { Component } from 'react';
import {
    StyleSheet, Text, View,
    ScrollView,
    TextInput,
    Alert,
    Platform, Image

} from 'react-native';
import Button from './Button';
import { LinearGradient } from 'expo'
import { Facebook } from 'expo';
import TextInputWTitle from './inputText.js';
import InputPassword from './inputPassword.js';
import { AsyncStorage } from 'react-native';

export default class perfilAnimal extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            id: '1',
            name: '',
            type: '',
            species: '',
            race: '',
            sex: 'Male',
            age: '',
            //PER CANVIAR EL FORMAT DE LA DATA, MIRAR "fromat" de <DatePicker> a l'inici del render()
            iniDate: "2019-04-15",
            endDate: '2019-04-15',
            description: '',
            image: '',
            isLoading: true
        }

    }
    async getOfferInfoFromAPI(tokenJson, id) {

        return fetch(`http://10.4.41.164/api/offers/${id}`, {
            method: 'GET',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
                'x-access-token': tokenJson.token
            }
        }).then((response) => response.json())
            .then((responseJson) => {
                console.log(responseJson);
                return responseJson;
            }).catch((error) => {
                console.error(error);
            });
    }

    async handleStart() {
        let desc, name, race, age, id, image
        id = this.props.navigation.getParam('id', '1')
        image = this.props.navigation.getParam('image', 'undefined')
        console.log(id)
        const token = await AsyncStorage.getItem("access_token");
        tokenJson = JSON.parse(token);
        const responseOffer = await this.getOfferInfoFromAPI(tokenJson, id);
        if (responseOffer.success) {
            name = responseOffer.offer.name,
                desc = responseOffer.offer.description,
                race = responseOffer.offer.raceName,
                age = responseOffer.offer.age
        }
        this.setState({
            name: name,
            description: desc,
            race: race,
            age: age,
            isLoading: false,
            image: image
        })
    }

    render() {
        if (this.state.isLoading) {
            this.handleStart();
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
                }}>
                <View style={{ flex: 1 }}>
                    <Image style={{
                        width: '100%',
                        height: '50%',
                        marginBottom: '5%'
                    }} source={{ uri: `${this.state.image}` }} />
                    <Text style={{ color: 'white', fontSize: 30, fontWeight: 'bold', flex: 1, marginLeft: '10%' }}>{this.state.name}</Text>
                    <Text style={{ color: 'white', fontSize: 20, flex: 1, marginLeft: '10%' }}>Age: {this.state.age}</Text>
                    <Text style={{ color: 'white', fontSize: 20, flex: 1, marginLeft: '10%' }}>Race: {this.state.race}</Text>
                    <Text style={{ color: 'white', fontSize: 20, flex: 1, marginLeft: '10%' }}>Sex: {this.state.sex}</Text>
                    <Text style={{ color: 'white', fontSize: 20, flex: 1, marginLeft: '10%' }}>Description: {this.state.description}</Text>
                </View>
            </LinearGradient>
        );
    }
}
