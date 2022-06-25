# FabFlix

FabFlix is a web-based e-commerce system based on CS 122B (Projects in Databases and Web Applications) at UC Irvine. It allows customers to search for and order movies. FabFlix uses a [single-page design](https://developer.mozilla.org/en-US/docs/Glossary/SPA) and microservices.


## Backend

The backend is built using the [Spring Boot Framework](https://spring.io/projects/spring-boot) in Java, which allows us to communicate with the MySQL database using JDBC and process JSON using Jackson.

The design uses an [API gateway](/backend/gateway/) that authenticates customers through the [Identity Management Service](/backend/idm/) before accessing the privileged microservices.


### Privileged Microservices:
- [Billing Service](/backend/billing/) - Allows customers to add movies to their carts, checkout by working with the [Stripe API](https://stripe.com/docs/payments/quickstart), and view their order history. The cart and order history is saved in the database, allowing them to persist across multiple sessions.
- [Movies](/backend/movies/) - Allows customers to search for movies using the titles, genres, directors, and/or release years and order the results by title, rating, or year. The movie data is obtained from [The Movie Database (TMDB)](https://themoviedb.org).

## Frontend
The frontend includes a [web app](/frontend/web/) built with the [React](https://reactjs.org/) library in JavaScript which enables the single-page design and a [mobile app](/frontend/native/) built with the [React Native](https://reactnative.dev) library in JavaScript.

Checkout these demos:

- [Web App](https://www.youtube.com/watch?v=LdGi30Qjqbo)

- [Android App](https://www.youtube.com/watch?v=OHcX4HqyIjE)