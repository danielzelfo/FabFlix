import React, { useState, useEffect } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import {order_payment} from "backend/billing";
import CheckoutForm from "../components/CheckoutForm";
import {useUser} from "hook/User";
import { AppStyles } from "style/Styles";
import { View } from "react-native";
import {useCart} from "hook/Cart";
import { useNavigate } from "react-router-dom";

// Make sure to call loadStripe outside of a component’s render to avoid
// recreating the Stripe object on every render.
// This is a public sample test API key.
// Don’t submit any personally identifiable information in requests made with this key.
// Sign in to see your own test API key embedded in code samples.
const stripePromise = loadStripe("pk_test_51Kwhu6KXz20zOaBv5b4OftnYQDIfamXkIk0PSJzCPrUFselbFtXirU63z2r49mxfX6rEatM8F8qNf8zyubbv6NDO00do68iGh0");

export function Checkout() {
  const [clientSecret, setClientSecret] = useState("");

  const {accessToken} = useUser();

  const {clearCartLocal} = useCart();

  const navigate = useNavigate();

  const handleOrderPaymentResponse = (response) => {
    if (response.data.result.code === 3004) {
      clearCartLocal();
      navigate("/cart");
      return;
    }

    if (response.data.result.code === 3005) {
      alert("Internal server error. Please try again later.");
      navigate("/cart");
      return;
    }

    setClientSecret(response.data.clientSecret);

  }

  useEffect(() => {
    order_payment(accessToken)
      .then((response) => handleOrderPaymentResponse(response))
    
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const appearance = {
    theme: 'stripe',
  };
  const options = {
    clientSecret,
    appearance,
  };

  return (
    <View style={AppStyles.MainDiv}>
      {clientSecret && (
        <Elements options={options} stripe={stripePromise}>
          <CheckoutForm />
        </Elements>
      )}
    </View>
  );
}