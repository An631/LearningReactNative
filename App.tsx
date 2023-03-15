/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  NativeSyntheticEvent,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  TextInput,
  TextInputSelectionChangeEventData,
  useColorScheme,
  View,
} from 'react-native';

import {
  Colors,
  Header,
} from 'react-native/Libraries/NewAppScreen';

function isNumbersOnly(text: string) {
  const removedSymbolsText = text.replace(/[ \-_]*/g,'')
  return removedSymbolsText.match(/^[0-9]*$/g)
}

function fillMissingWithPlaceholders(digits: string, length: number): string {
  const newDigits = []
  for(let i = 0; i < length; i++){
    if(digits[i] === undefined || !digits[i].match(/[0-9]/g)){
      newDigits[i] = '_'
    } else {
      newDigits[i] = digits[i]
    }
  }
  return newDigits.join('')
}

function formatPhoneNumber( phoneNumber: string): string {
  const phoneNumberSections = phoneNumber.split('-')
  return `${fillMissingWithPlaceholders(phoneNumberSections[0], 3)}-${fillMissingWithPlaceholders(phoneNumberSections[1], 3)}-${fillMissingWithPlaceholders(phoneNumberSections[2], 4)}`
}

function App(): JSX.Element {
  const isDarkMode = useColorScheme() === 'dark';
  const [phoneNumber, setPhoneNumber] = useState(()=>'___-___-____');
  const [currentLocation, setCurrentLocation] = useState(0)

  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  };
  
  const handleSelectionChanged = useCallback((e: NativeSyntheticEvent<TextInputSelectionChangeEventData>) => {
    if(e.nativeEvent.selection.end !== e.nativeEvent.selection.start ) {
      // this is not a click or arrow move event so ignore it
      return
    }
    const isCurrentLocationAndNotAtBeginning = e.nativeEvent.selection.start === currentLocation && e.nativeEvent.selection.start !== 0
    const isAtEndOfPhoneNumber = e.nativeEvent.selection.start === phoneNumber.length
    const newLocation = isCurrentLocationAndNotAtBeginning || isAtEndOfPhoneNumber
      ? e.nativeEvent.selection.start - 1
      : e.nativeEvent.selection.start
    
    setCurrentLocation(  
      phoneNumber[newLocation] === '-'
      ? currentLocation === newLocation - 1
        ? newLocation + 1
        : newLocation - 1
      : newLocation
    )
  }, [phoneNumber, currentLocation])

  return (
    <SafeAreaView style={backgroundStyle}>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={backgroundStyle.backgroundColor}
      />
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        style={backgroundStyle}>
        <Header />
        <View
          style={{
            backgroundColor: isDarkMode ? Colors.black : Colors.white,
          }}>
          <TextInput 
            selection={{
              start: currentLocation,
              end: currentLocation + 1
            }}
            onSelectionChange = {handleSelectionChanged}
            cursorColor='#0f0'
            value={phoneNumber}
            onChangeText={(text) => {
              if(isNumbersOnly(text) && text !== phoneNumber){
                setPhoneNumber(formatPhoneNumber(text))
              }
          }}></TextInput>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  sectionContainer: {
    marginTop: 32,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
  },
  sectionDescription: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '400',
  },
  highlight: {
    fontWeight: '700',
  },
});

export default App;
