import {Controller} from "react-hook-form";
import { View, Button, TextInput } from "react-native";
import {Component} from "react"
import {AppStyles} from "style/Styles";

export class CredentialForm extends Component {
  render() {
    return (
      <View style={AppStyles.CredentialForm}>
        <Controller
            name="email"
            control={this.props.control}
            render={
                ({ field: { value, onChange } }) => (
                <TextInput
                    value={value}
                    onChangeText={onChange}
                    placeholder="email"
                />
            )}
        />
        <Controller
            name="password"
            control={this.props.control}
            render={({ field: { value, onChange } }) => (
                <TextInput
                    value={value}
                    onChangeText={onChange}
                    secureTextEntry={true}
                    placeholder="Password"
                />
            )}
        />
        <Button title={this.props.title} onPress={this.props.onPress} />
    </View>
    )
  }
}