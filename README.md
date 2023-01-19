# FabFlix

**Disclaimer**: This project is based on a project for CS 122B (Projects in Databases and Web Applications) at UC Irvine. It is intended for educational and demonstration purposes only.

FabFlix is a web-based e-commerce system that allows customers to search for and order movies. Built using the [Spring Boot Framework](https://spring.io/projects/spring-boot) in Java, it utilizes a [single-page design](https://developer.mozilla.org/en-US/docs/Glossary/SPA) and microservices architecture to ensure a seamless user experience. 

## Features
- Search and order movies by title, genre, director, and release year
- Add movies to cart, checkout using [Stripe API](https://stripe.com/docs/payments/quickstart), and view order history
- Authenticate customers through an [API gateway](/backend/gateway/) and [Identity Management Service](/backend/idm/)
- Obtain movie data from [The Movie Database (TMDB)](https://themoviedb.org)
- Web and mobile app versions available

## Technical Details

### Backend
- Spring Boot Framework
- MySQL database with JDBC
- JSON processing with Jackson

### Privileged Microservices:
- [Billing Service](/backend/billing/) - handles cart, checkout, and order history
- [Movies Service](/backend/movies/) - search and sort movies

### Frontend
- Web App built with React
- Mobile App built with React Native

Check out our demos for a preview of the user experience:
- [Web App](https://www.youtube.com/watch?v=LdGi30Qjqbo)
- [Android App](https://www.youtube.com/watch?v=OHcX4HqyIjE)

## Getting Started

To get started with FabFlix, please refer to the appropriate directory under [backend](/backend/) and [frontend](/frontend/) to view the README files for specific instructions on how to run and use the system.