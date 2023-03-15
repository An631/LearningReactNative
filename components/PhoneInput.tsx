import {useCallback, useState} from 'react';
import {
  NativeSyntheticEvent,
  TextInput,
  TextInputKeyPressEventData,
  TextInputSelectionChangeEventData,
} from 'react-native';

type NumbersOnly = '0' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9'
function hasNumbersOnly(maybeNumbersOnly: string): maybeNumbersOnly is NumbersOnly {
  return maybeNumbersOnly.match(/[0-9]/) ? true : false
}

function replaceChar(text: string, char: string, index: number): string {
  return text.substring(0, index) + char + text.substring(index+1)
}

function runIfIndexIsWithinTextSize<T>(command: () => T, index: number, text: string): T | undefined {
  if(index >= 0 && index < text.length){
    return command()
  }
}

export function PhoneInput(): JSX.Element {
  const [phoneNumber, setPhoneNumber] = useState(() => '___-___-____');
  const [currentLocation, setCurrentLocation] = useState(0);

  /**
   * Handles the different selection states that can occurr when the user is navigating the text
   * Cases handled are:
   * 1. Clicking on any spot
   * 2. Left Arrow key press
   * 3. Right Arrow key press
   * 4. End key press
   * 5. Home key press
   * 6. Ctrl + left arrow press
   * 7. Ctrl + right arrow press
   */
  const handleSelectionChanged = useCallback(
    (e: NativeSyntheticEvent<TextInputSelectionChangeEventData>) => {
      const newLocationStart = e.nativeEvent.selection.start
      const newLocationEnd = e.nativeEvent.selection.end
      const isSingleSelection = newLocationEnd === newLocationStart
      const pressedArrowKeyLeft = isSingleSelection && newLocationStart === currentLocation
      const pressedArrowKeyRight = isSingleSelection && newLocationStart - 1 === currentLocation
      const isClick = isSingleSelection && !pressedArrowKeyLeft && !pressedArrowKeyRight
      const isAtDashCharacter = phoneNumber[newLocationStart] === '-'
      const setLocation = (locationToSet: number) => runIfIndexIsWithinTextSize(()=>setCurrentLocation(locationToSet), locationToSet, phoneNumber)
      if(isAtDashCharacter){
        if(pressedArrowKeyLeft){
          throw new Error('This is an unexepcted state, the user should never land on a dash after pressing left key arrow.')
        }
  
        if(pressedArrowKeyRight){
          setLocation(newLocationStart + 1)
        }
  
        if(isClick) {
          setLocation(newLocationStart + 1)
        }
        return
      }
      
      if(pressedArrowKeyRight){
        setLocation(newLocationStart)
      }
    
      if(pressedArrowKeyLeft){
        // Special case when moving left with the keys because the cursor ends up in the same position as the current one and we are going 
        // to force the cursor to move one over which could land the user in a dash character.
        const willBeAtDashCharacter = phoneNumber[newLocationStart - 1] === '-'
        setLocation(willBeAtDashCharacter
          ? newLocationStart - 2
          : newLocationStart -1
          )
      }
      
      if(isClick){
        // Special case if pressing END key the cursor goes to the last location of the text which is equal to the size of the text.
        // To avoid that problem keep the cursor one before the end of the text.
        const isLocationAfterText = newLocationStart === phoneNumber.length
        setLocation(isLocationAfterText ? newLocationStart-1 : newLocationStart)
      }
    },
    [phoneNumber, currentLocation],
  );

  /**
   * Handles the editing of the currently selected char and moving the cursor after given update.
   * Only numbers and backspace keys are allowed.
   *
   * @param e Event fired due to a Key pressed
   */
  const handleKeyPress = (e: NativeSyntheticEvent<TextInputKeyPressEventData>) => {
    const moveLocationAfterSetting = (char: '_' | NumbersOnly, newLocation: number)=>{
      runIfIndexIsWithinTextSize(()=>setCurrentLocation(newLocation), newLocation, phoneNumber)
      setPhoneNumber(replaceChar(phoneNumber, char, currentLocation))
    }
    
    const pressedKey = e.nativeEvent.key
    if(pressedKey === 'Backspace' || pressedKey === 'Delete'){
      // Deal with a move that might land the user in a dash character, move backwards one extra space to avoid it.
      const newLocation = phoneNumber[currentLocation - 1] === '-' ? currentLocation - 2 : currentLocation - 1
      moveLocationAfterSetting('_', newLocation)
    }
    if(hasNumbersOnly(pressedKey)){
      // Deal with a move that might land the user in a dash character, move forward one extra space to avoid it.
      const newLocation = phoneNumber[currentLocation + 1] === '-' ? currentLocation + 2 : currentLocation + 1
      moveLocationAfterSetting(pressedKey, newLocation)
    }
  }

  return (
    <TextInput
      selection={{
        start: currentLocation,
        end: currentLocation + 1,
      }}
      onSelectionChange={handleSelectionChanged}
      cursorColor='blue'
      value={phoneNumber}
      onKeyPress={handleKeyPress}
      editable={false}
    />
  );
}
