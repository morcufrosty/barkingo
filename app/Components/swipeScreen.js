import React from 'react';
import { StyleSheet, Text, View, Dimensions, Image, Animated, PanResponder, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo';
import { AsyncStorage } from 'react-native';
import strings from '../i18n/i18n';
const SCREEN_HEIGHT = Dimensions.get('window').height
const SCREEN_WIDTH = Dimensions.get('window').width
import Icon from 'react-native-vector-icons/FontAwesome';

export default class swipeScreen extends React.Component {

  constructor() {
    super()

    this.position = new Animated.ValueXY()
    this.state = {
      currentIndex: 0,
      offers: [],
      images: [],
      isLoading: true
    }



    this.rotate = this.position.x.interpolate({
      inputRange: [-SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2],
      outputRange: ['-10deg', '0deg', '10deg'],
      extrapolate: 'clamp'
    })

    this.rotateAndTranslate = {
      transform: [{
        rotate: this.rotate
      },
      ...this.position.getTranslateTransform()
      ]
    }

    this.likeOpacity = this.position.x.interpolate({
      inputRange: [-SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2],
      outputRange: [0, 0, 1],
      extrapolate: 'clamp'
    })
    this.dislikeOpacity = this.position.x.interpolate({
      inputRange: [-SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2],
      outputRange: [1, 0, 0],
      extrapolate: 'clamp'
    })

    this.nextCardOpacity = this.position.x.interpolate({
      inputRange: [-SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2],
      outputRange: [1, 1, 1],
      extrapolate: 'clamp'
    })
    this.nextCardScale = this.position.x.interpolate({
      inputRange: [-SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2],
      outputRange: [1, 0.8, 1],
      extrapolate: 'clamp'
    })

  }


  async cacheImage(id, image) {
    await AsyncStorage.setItem(id, image);
  }

  async getImage(id) {
    return await AsyncStorage.getItem(id);
  }

  refresh() {
    this.setState({ isLoading: true, offers: [], images: [], currentIndex: 0 })
  }


  async handleSwipe(dir) {
    const id = this.state.offers[this.state.currentIndex].id;
    const t = await AsyncStorage.getItem("access_token");
    tokenJson = JSON.parse(t);
    const response = await this.SwipeToAPI(tokenJson, id, dir);

    if (this.state.currentIndex === (this.state.offers.length)) {
      console.log("Refresh");
      this.refresh();

    }
  }



  async SwipeToAPI(tokenJson, id, direction) {

    return fetch(`http://10.4.41.164/api/offers/${id}`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'x-access-token': tokenJson.token,

      },
      body: JSON.stringify({
        direction

      }),
    }).then((response) => response.json())
      .then((responseJson) => {
        console.log(responseJson.msg);
        return responseJson;
      }).catch((error) => {
        console.error(error);
      });
  }

  componentWillMount() {
    this.PanResponder = PanResponder.create({

      onStartShouldSetPanResponder: (evt, gestureState) => true,
      onPanResponderMove: (evt, gestureState) => {

        this.position.setValue({ x: gestureState.dx, y: gestureState.dy })
      },
      onPanResponderRelease: (evt, gestureState) => {

        if (gestureState.dx > 120) { //SWIPE RIGHT
          Animated.spring(this.position, {
            toValue: { x: SCREEN_WIDTH + 100, y: gestureState.dy }
          }).start(() => {
            this.setState({ currentIndex: this.state.currentIndex + 1 }, () => {
              this.position.setValue({ x: 0, y: 0 })

            })
            this.handleSwipe("right");

          })
        }
        else if (gestureState.dx < -120) { //SWIPE LEFT
          Animated.spring(this.position, {
            toValue: { x: -SCREEN_WIDTH - 100, y: gestureState.dy }
          }).start(() => {
            this.setState({ currentIndex: this.state.currentIndex + 1 }, () => {
              this.position.setValue({ x: 0, y: 0 })
            })
          })

          this.handleSwipe("left");

        }
        if (gestureState.dy > -5 && gestureState.dy < 5 && gestureState.dx > -5 && gestureState.dx < 5) {
          this.props.navigation.navigate('perfilAnimalSwipe', { id: this.state.offers[this.state.currentIndex].id, image: this.state.images[this.state.currentIndex] });


        }
        else {
          Animated.spring(this.position, {
            toValue: { x: 0, y: 0 },
            friction: 4
          }).start()
        }
      }
    })
  }



  async getOffers(tokenJson, str) {


    return fetch(`http://10.4.41.164/api/offers${str}`, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'x-access-token': tokenJson.token
      }
    }).then((response) => response.json())
      .then((responseJson) => {
        return responseJson;
      }).catch((error) => {
        console.error(error);
      });

  }

  async getImageFromServer(tokenJson, id, i) {


    return fetch(`http://10.4.41.164/api/offers/${id}/image`, {
      method: 'GET',
      headers: {
        Accept: '*',
        'x-access-token': tokenJson.token
      }
    }).then((response => {
      return response.text();
    }))

  }

  handleQuery(filterJson) {
    let first = true;
    let str = ""

    if (filterJson.distanceFilter) {
      if(first){
        str +="?"
        first = false;
      }
      else{
        str +="&"
      }
        
      str += "radius=" + filterJson.radius
    }
    if (filterJson.sex != "") {
      if(first){
        str +="?"
        first = false;

      }
      else{
        str +="&"
      }
      str += "sex=" + filterJson.sex
    }
    if (filterJson.ageFilter) {
      if(first){
        str +="?"
        first = false;

      }
      else{
        str +="&"
      }
      str += "minAge=" + filterJson.minAge
      str += "&maxAge=" + filterJson.maxAge
    }
    if (filterJson.species != "") {
      if(first){
        str +="?"
        first = false;

      }
      else{
        str +="&"
      }
      str += "species=" + filterJson.species
    }
    if (filterJson.type != "") {
      if(first){
        str +="?"
        first = false;

      }
      else{
        str +="&"
      }
      str += "type=" + filterJson.type
    }
    if (first)
      return ""

    return str
  }


  async getCurrentUserFromAPI(tokenJson) {

    return fetch('http://10.4.41.164/api/users/currentUser', {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'x-access-token': tokenJson.token
      }
    }).then((response) => response.json())
      .then((responseJson) => {
        return responseJson;
      }).catch((error) => {
        console.error(error);
      });

  }
  async handleStart() {

    let ofertesAux = []
    let imatgesAux = []
    let filterJson;
    let str = ""
    const t = await AsyncStorage.getItem('access_token');
    tokenJson = JSON.parse(t);

    const currentUserResponse = await this.getCurrentUserFromAPI(tokenJson);

    if (currentUserResponse.success) {

      let filters = await AsyncStorage.getItem(currentUserResponse.user.id);
      filterJson = JSON.parse(filters);

    }

    if (filterJson != null) {

      str = this.handleQuery(filterJson)
    }


    console.log("QUERY" + str);
    const response = await this.getOffers(tokenJson, str);
    console.log(response);


    if (response.success) {
      ofertesAux = response.offers

      for (let i = 0; i < ofertesAux.length; i++) {
        let id = ofertesAux[i].id;
        this.getImageFromServer(tokenJson, id, i).then((value) => {
          let images = this.state.images;
          images[i] = "data:image/jpeg;base64," + value;
          this.setState({ images: images });
        })

      }

    }


    this.setState({ isLoading: false, offers: ofertesAux, images: imatgesAux })


  }





  renderUsers = () => {

    if (this.state.offers.length != 0) {

      return this.state.offers.map((item, i) => {


        if (i < this.state.currentIndex) {
          return null
        }
        else if (i == this.state.currentIndex) {

          return (

            <Animated.View
              {...this.PanResponder.panHandlers}
              key={item.id} style={[this.rotateAndTranslate, { height: SCREEN_HEIGHT - 180, width: SCREEN_WIDTH, padding: 10, position: 'absolute' }]}>
              <Animated.View style={{ opacity: this.likeOpacity, transform: [{ rotate: '-30deg' }], position: 'absolute', top: 50, left: 40, zIndex: 1000 }}>
                <Text style={{ borderWidth: 1, borderColor: 'green', color: 'green', fontSize: 32, fontWeight: '800', padding: 10 }}>{strings('swipeScreen.Like')}</Text>
              </Animated.View>
              <Animated.View style={{ opacity: this.dislikeOpacity, transform: [{ rotate: '30deg' }], position: 'absolute', top: 50, right: 40, zIndex: 1000 }}>
                <Text style={{ borderWidth: 1, borderColor: 'red', color: 'red', fontSize: 32, fontWeight: '800', padding: 10 }}>{strings('swipeScreen.Dislike')}</Text>
              </Animated.View>
              <Animated.View style={{ opacity: 1, position: 'absolute', bottom: 20, right: 40, zIndex: 1000 }}>
                <Text style={{ color: '#ffffff', fontSize: 32, fontWeight: '800', padding: 10 }}> {item.name}</Text>
              </Animated.View>

              <Image
                style={{ flex: 1, height: null, width: null, resizeMode: 'cover', borderRadius: 20, backgroundColor: "#f29797" }}
                source={{ uri: `${this.state.images[i]}` }} />

            </Animated.View>


          )
        }
        else {
          return (
            <Animated.View
              {...this.PanResponder.panHandlers}

              key={item.id} style={[{
                opacity: this.nextCardOpacity,
                transform: [{ scale: this.nextCardScale }],
                height: SCREEN_HEIGHT - 180, width: SCREEN_WIDTH, padding: 10, position: 'absolute'
              }]}>

              <Animated.View style={{ opacity: 0, transform: [{ rotate: '-30deg' }], position: 'absolute', top: 50, left: 40, zIndex: 1000 }}>
                <Text style={{ borderWidth: 1, borderColor: 'green', color: 'green', fontSize: 32, fontWeight: '800', padding: 10 }}>{strings('swipeScreen.Like')}</Text>
              </Animated.View>
              <Animated.View style={{ opacity: 0, transform: [{ rotate: '30deg' }], position: 'absolute', top: 50, right: 40, zIndex: 1000 }}>
                <Text style={{ borderWidth: 1, borderColor: 'red', color: 'red', fontSize: 32, fontWeight: '800', padding: 10 }}>{strings('swipeScreen.DisLike')}</Text>
              </Animated.View>
              <Animated.View style={{ opacity: 1, position: 'absolute', bottom: 20, right: 40, zIndex: 1000 }}>
                <Text style={{ color: '#ffffff', fontSize: 32, fontWeight: '800', padding: 10 }}></Text>
              </Animated.View>
              <Image
                style={{ flex: 1, height: null, width: null, resizeMode: 'cover', borderRadius: 20, backgroundColor: "#f29797" }}
                source={{ uri: `${this.state.images[this.state.currentIndex + 1]}` }} />

            </Animated.View>

          )
        }
      }).reverse()
    }
    else return (<Text onPress={() => { this.refresh() }} style={{ color: '#ffffff', fontSize: 17, margin: 'auto', marginTop: '50%', flex: 1, textAlign: 'center', fontWeight: '800', padding: 10, }}> {strings('swipeScreen.NoOffers')} </Text>)


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
        <ActivityIndicator size="small" color="#ffffff" />
        <TouchableOpacity
          style={{
            position: 'absolute',
            top: 40,
            right: 15,
            width: 20,
            height: 20
          }}
          onPress={() => this.props.navigation.navigate('Filter', { onGoBack: () => this.refresh() })}>
          <Icon name={"filter"} size={20} color="#FFFFFF" />
        </TouchableOpacity>

      </LinearGradient>;
    }


    return (
      <LinearGradient colors={['#F15A24', '#D4145A']}
        start={[0, 1]}
        end={[1, 0]}
        style={{
          flex: 1,
        }}>
        <TouchableOpacity
          style={{
            position: 'absolute',
            top: 40,
            right: 15
          }}
          onPress={() => this.props.navigation.navigate('Filter', { onGoBack: () => this.refresh() })}>
          <Icon name={"filter"} size={20} color="#FFFFFF" />
        </TouchableOpacity>

        <View style={{ height: 60 }}>
        </View>

        <View style={{ flex: 1 }}>

          {this.renderUsers()}

        </View>

        <View style={{ height: 120 }}>
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
