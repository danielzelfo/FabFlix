# FabFlix Backend - The Gateway Service

#### [Application](#application)

- [pom.xml](#pomxml)
- [application.yml](#applicationyml)
- [Resources](#resources)
- [Tests](#tests)

#### [Database](#database)

- [Schemas](#schemas)
- [Tables](#tables)

#### [Routes](#routes)

- [IDM](#idm)
- [Movies](#movies)
- [Billing](#billing)

#### [Filters](#filters)

- [GlobalLoggingFilter](#globalloggingfilter)
- [AuthFilter](#authfilter)

## Application

### pom.xml

Maven gets all its settings from a file called `pom.xml`. This file determines the dependencies we
will use in our project as well as the plugins we use for compiling, testing, building, ect..

- [pom.xml](pom.xml)

### application.yml

Spring Boot has a large number of settings that can be set with a file called `application.yml`. We
have already created this file for you and have filled it with some settings. There is a file for
the main application as well as one for the tests.

- [Main application.yml](src/main/resources/application.yml)
- [Test application.yml](src/test/resources/application.yml)

### Resources

There are two folders in this project that contain resources, and application settings, as well as
files required for the tests.

- [Main Resources](src/main/resources)
- [Test Resources](src/test/resources)

### Tests

There is a Single class that contain all of our test cases:

- [GatewayServiceTest](src/test/java/com/github/klefstad_teaching/cs122b/gateway/GatewayServiceTest.java)

## Database

### Schemas

<table>
  <thead>
    <tr>
      <th align="left" width="1100">🗄 gateway</th>
    </tr>
  </thead>
</table>

### Tables

<table>
  <tbody>
    <tr>
      <th colspan="3" align="left" width="1100">💾 gateway.request</th>
    </tr>
    <tr></tr>
    <tr>
      <th align="left" width="175">Column Name</th>
      <th align="left" width="175">Type</th>
      <th align="left">Attributes</th>
    </tr>
    <tr>
      <td>id</td>
      <td><code>INT</code></td>
      <td><code>NOT NULL</code> <code>PRIMARY KEY</code> <code>AUTO_INCREMENT</code></td>
    </tr>
    <tr></tr>
    <tr>
      <td>ip_address</td>
      <td><code>VARCHAR(64)</code></td>
      <td><code>NOT NULL</code></td>
    </tr>
    <tr></tr>
    <tr>
      <td>call_time</td>
      <td><code>TIMESTAMP</code></td>
      <td><code>NOT NULL</code></td>
    </tr>
    <tr></tr>
    <tr>
      <td>path</td>
      <td><code>VARCHAR(2048)</code></td>
      <td><code>NULL</code></td>
    </tr>
  </tbody>
</table>

## Routes

The first job the Gateway has is to create "Routes" for incoming requests. We can tell our Gateway that when a request comes in that matches a specific `regex` to **Redirect** the request to another `URI` (Another Service). When the request comes in that matches one of these `regex` we can then redirect the request with or without a filter and we can even manipulate the `path` that was send to us.

For all of the `Routes` we have we need to remove the prefix (`/idm`, `/movies`, `/billing`) since our other backends do not contain these prefix's. In our `IDM` we have a endpoint that has the path `/login` if a user wants to reach this endpoint they would talk to our Gateway server with the path `/idm/login`. It is up to us to *remove* the prefix and redirect the call to our `IDM`'s `URI` with the prefix removed, like so: `/login`

### IDM

Since the `IDM` is not Secured Service we do not need to apply the `AuthFilter` to it.

We need to capture all incoming requests that match the `Regex` descibed below in the table, and remove the `/idm` prefix from the path.

<table>
  <tbody >
    <tr>
      <th colspan="3" align="left" width="1100">🧳&nbsp;&nbsp;Path</th>
    </tr>
    <tr></tr>
    <tr>
      <th align="left">Regex</th>
      <th colspan="2" align="left">Example</th>
    </tr>
    <tr>
      <td align="left"><code>/idm/**</code></td>
      <td colspan="2" align="left"><code>/idm/login</code></td>
    </tr>
  </tbody>
</table>

### Movies

Since the `Movies` **IS** a Secured Service we **DO** need to `AuthFilter` to it. 

We also need to capture all incoming requests that match the `Regex` descibed below in the table, and remove the `/movies` prefix from the path.

<table>
  <tbody >
    <tr>
      <th colspan="3" align="left" width="1100">🧳&nbsp;&nbsp;Path</th>
    </tr>
    <tr></tr>
    <tr>
      <th align="left">Regex</th>
      <th colspan="2" align="left">Example</th>
    </tr>
    <tr>
      <td align="left"><code>/movies/**</code></td>
      <td colspan="2" align="left"><code>/movies/movie/search</code></td>
    </tr>
    <tr><td colspan="3" ></td></tr>
    <tr></tr>
    <tr>
      <th colspan="3" align="left" width="1100">🎛️&nbsp;&nbsp;Filter</th>
    </tr>
    <tr>
      <td colspan="3" align="left"><code>AuthFilter</code></td>
    </tr>
  </tbody>
</table>

### Billing

Since the `Billing` **IS** a Secured Service we **DO** need to `AuthFilter` to it. 

We also need to capture all incoming requests that match the `Regex` descibed below in the table, and remove the `/billing` prefix from the path.

<table>
  <tbody >
    <tr>
      <th colspan="3" align="left" width="1100">🧳&nbsp;&nbsp;Path</th>
    </tr>
    <tr></tr>
    <tr>
      <th align="left">Regex</th>
      <th colspan="2" align="left">Example</th>
    </tr>
    <tr>
      <td align="left"><code>/billing/**</code></td>
      <td colspan="2" align="left"><code>/billing/cart/insert</code></td>
    </tr>
    <tr><td colspan="3" ></td></tr>
    <tr></tr>
    <tr>
      <th colspan="3" align="left" width="1100">🎛️&nbsp;&nbsp;Filter</th>
    </tr>
    <tr>
      <td colspan="3" align="left"><code>AuthFilter</code></td>
    </tr>
  </tbody>
</table>

## Filters

### GlobalLoggingFilter

This filter will always be called for every incoming requests. It should **NOT** be added mannually to the routes above. It is considered a `GlobalFilter` and will apply automatically. 

#### LinkedBlockingQueue
In our database we are creating `gateway.request` we should first create a class that allows us to store the details of this request in a object to hold on to. (I will refer to this as the `GatewayRequestObject`.

We should also create a `LinkedBlockingQueue` that will keep track of all of the `GatewayRequestObject`'s 

When a request comes in we should map all the data from that request into a `GatewayRequestObject` and then add it into the `LinkedBlockingQueue`. We can get the incoming request by calling `exchange.getRequest()`.

When the `LinkedBlockingQueue` reaches a certain limit (this limit is defined in the `GatewayServiceConfig` and can be retrieved with the `GatewayServiceConfig::getMaxLogs()` function) we need to take all the requests from the queue and then do a database query to insert them all.

When we want to remove all the values in the queue we need to do so with "multi-threading" in mind. To do this we can create a new `List` and then call the `LinkedBlockingQueue::drainTo()` function. Once we have drained the queue we can take that new list and use it to create our `batchUpdate` call.

### AuthFilter

This filter is applied only to `route()`s that have it listed in the routes `filters(f -> f)` lambda.

This filter is responsible for taking the `Authorization` header from the request. Then removing the `Bearer ` prefix from it in order to get the user's `accessToken` we can then take that `accessToken` and make a request to our `IDM`'s `/authenticate` endpoint in order to validate our user.

In this filter we have two options of how to "end" it. We either end it in success by returning `chain.filter(exchange)` (this means to just continue on the redirecting the request) or we return `exchange.getResponse().setComplete()` to end the request right there. Please note that before returning `exchange.getResponse().setComplete()` you should call `exchange.getResponse().setStatusCode(httpStatus)` in order to set the "error" for why we are ending the request. For this filter if we need to end in failure and return `exchange.getResponse().setComplete()` you should set the status code to `HttpStatus.UNAUTHORIZED`

Because we can not block in this filter we will need to make sure that out `rest call` to our idm is "part of the chain" that we return at the end of the function.