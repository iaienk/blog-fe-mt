# Socket Event: CREATE_POST

## Functional Requirements Covered

- _FR5_ – Authenticated users can create posts

- _FR6_ – Each post includes: title, content, publish date, author, optional image and one or more tags

- _FR7_ – Posts can have multiple reusable tags

- _FR8_ – Tags are created or reused on post creation

## Event Purpose

The CREATE_POST socket event allows an authenticated user to create a blog post, optionally including tags and sharing it with other users.

## Authentication

This event requires authentication (a valid JWT). The authorId is inferred from the JWT user data:
`this.user.sub`

## Payload Example

```js
{
  title: "Socket.Io Post",
  content: "<p>Understanding namespaces and rooms</p>",
  publishDate: 1717250400000,
  authorId: ["6634ac4e3a81277f545b84d2"]
  userIds: ["6634ac4e3a81277f545b84d2", "6634ac4e3a81277f545b84d3"],
  image: "",
  tags: ["socket.io", "websockets"]
}
```

## Input Validation

Handled by: _CreatePostValidator_

- All fields are strictly validated

- Tag names must be non-empty strings

- IDs must be valid 24-char hex strings.

- Invalid input throws BadRequestException with Joi-based message.

- Tags with same name are not duplicated

## Success Server Response

```js
{
  success: true,
  data: {
    id: "665601409b6c6819f7b62a85",
    title: "Socket.IO Post",
    content: "<p>Understanding namespaces and rooms</p>",
    publishDate: "2024-06-01T10:00:00.000Z",
    authorId: "6634ac4e3a81277f545b84d1",
    userIds: ["6634ac4e3a81277f545b84d2", "6634ac4e3a81277f545b84d3"],
    image: "https://example.com/image.jpg",
    tags: ["socket.io", "websockets" ],
    totalLikes: 0,
    totalComments: 0,
  }
}
```

## Error Server Response

```js
{
  success: false,
  error: {
    code: 400,
    status: 400,
    message: "\"title\" is required"
  }
}
```

## Flow

Handled by: _CreatePostEventHandler_

The CreatePostEventHandler handles the `CREATE_POST event` emitted by the client.
It first checks if the user is authenticated, then validates the input data and creates the post.
After successfully creating the post, it sends a confirmation to the sender and notifies all specified userIds via socket events.

In `PostService.createPost`:

- Sets a fallback for userIds: defaults to an empty array ([]) if not provided

- Filters and keeps only existing active users from the provided userIds

- Resolves tags using TagService.resolveTags:

  - Normalizes each tag (lowercased and trimmed)
  - Reuses existing tags by checking if they already exist in DB
  - If a tag does not exist, creates it using TagRepository.create
  - All resolved tags (both new and existing) are returned as tag documents
  - The resolved tag names (from `.name`) are then mapped to `data.tags` to ensure only the tag strings are stored in the post document

In `PostRepository.create`:

- Creates and saves the post in the database using postSchema.create

- Catches any DB errors and throws a MongoInternalException with context

- Returns the newly created post as a Post object

## Tag Resolution Logic

Handled by: _TagService_

- The function normalizes tag names

- For each tag name:

  - If the tag exists → fetch it from the database

  - If not → create it via `TagRepository.create`

  The function returns an array of tag documents (`{ _id, name }`)

- These are then transformed into tag names via `.map(tag => tag.name)` before saving to the post. This guarantees consistent tag persistence and avoids duplicates

## Tag Response

```js
 tags: [ 'technology', 'lifestyle'],
```

## Broadcasted Events

Once the post is created:

- If the userId matches the author (this.user.sub), it emits the `POST_CREATED event`

- Otherwise, it emits the `POST_SHARED event`

- Each event is sent via socket directly to the corresponding userId

```js
this.socket.to(userId).emit(eventName, post.toJSON());
```

This ensures the author is notified of the post creation, while other specified users receive a post sharing notification. Users who are not active or don’t exist are excluded, so they won’t receive events.

# Socket Event: UPDATE_POST

## Functional Requirements Covered

- _FR9_ – Authenticated users can update their own posts

- _FR6_ – Each post includes: title, content, publish date, author, optional image, and one or more tags

- _FR7_ – Posts can have multiple reusable tags

- _FR8_ – Tags are created or reused on post update

## Event Purpose

The `UPDATE_POST` socket event allows an authenticated user to update an existing blog post’s details, including title, content, publish date and associated tags.

## Authentication

This event requires authentication (a valid JWT). The authorId is inferred from the JWT user data:
`this.user.sub`

## Payload Example

```js
{
  postId: '683854d96e5c716a8857ceca',
  title: 'Updated Title',
  content: 'Updated Content',
  publishDate: 1748522211961,
  tags: [ 'tag1', 'tag2' ]
}
```

## Input Validation

Handled by: _UpdatePostValidator_

- requires postId as a 24-char hex string

- requires title with a minimum length of 3

- requires content with a minimum length of 10

- optionally accepts publishDate as a future timestamp

- optionally accepts tags as an array of non-empty strings

- On validation failure, throws BadRequestException with Joi-based error details

## Success Server Response

```js
{
  success: true,
  data: {
    id: '683854d96e5c716a8857ceca',
    title: 'Updated Title',
    content: 'Updated Content',
    publishDate: '2025-05-29T12:36:51.961Z',
    authorId: '683854d96e5c716a8857cebe',
    userIds: [ '683854d96e5c716a8857cebe' ],
    image: '',
    tags: ['development'],
    totalLikes: 0,
    totalComments: 0
  }
}
```

## Error Server Response

```js
{
  success: false,
  error: {
     code: 400,
    status: 400,
    message: "\"title\" length must be at least 3 characters long"
  }
}
```

## Flow

Handled by: _UpdatePostEventHandler_

The UpdatePostEventHandler listens for the `UPDATE_POST event` from the client. It validates the input data, extracts the post ID and update fields, and verifies the user's identity. It then delegates the update logic to the service layer. On success, it returns the updated post data; on error, it sends a proper error response.

In `PostService.updatePost`:

- If tags are provided, resolve them using `TagService.resolveTags`, which reuses existing tags or creates new ones as needed

- Delegate the update operation to `postRepository.updatePost`, passing the postId, updated data, and authorId

In `PostRepository.updatePost`:

- Uses `findOneAndUpdate` to update the post matching the given \_id and authorId.

- Applies the updates and returns the updated post document

- If the post is not found, throws NotFoundException

- Returns an instance of the Post domain object

## Tag Resolution Logic

Handled by: _TagService_

-Normalizes tag names (trimmed and lowercased)

- For each tag name:

  - Reuses existing tags

  - Creates new tags if they don’t exist

- Returns an array of tag documents ({ \_id, name })

- The final array of tag names is extracted via .map(tag => tag.name) and stored in the post

## Broadcasted Events

“No broadcast events are triggered on post updates, unlike post creation or sharing.”

# Socket Event: DELETE_POST

## Functional Requirements Covered

- _FR10_ – Authenticated users can delete their own posts

## Authentication

This event requires authentication (a valid JWT). The authorId is inferred from the JWT user data:
`this.user.sub`

If the user is not authenticated or the user ID format is invalid (not a 24-character hexadecimal string), the server throws an UnauthorizedException with the message:
`"Invalid user session"`

## Input Validation

Handled by: _DeletePostValidator_

- postId is required (must be a 24-character hexadecimal string)

- Invalid input results in a BadRequestException with a Joi-based error message

## Success Server Response

The post is `soft-deleted` by setting its status to DELETED, and its tags are disassociated using the `TagService.removeTags method`.

```js
{
  success: true,
  data: {
    id: '6838cdf0e7b89f9e221af4fd'
  }
}
```

## Error Server Response

```js

{
  success: false,
  error: {
    status: 400,
    message: "\"postId\" length must be 24 characters long"
  }
}
```

## Flow

Handled by: _DeletePostEventHandler_

The DeletePostEventHandler listens for the `DELETE_POST event` from the client. It checks if the user is logged in and validates the data. Then, if the user is the post’s author, it performs a soft delete and sends either a success confirmation or an error response back to the client.

In `PostService.deletePost`

- Calls `postRepository.deletePost(postId, authorId)` to soft-delete the post by setting status to DELETED.

- If the post is found and soft-deleted, it returns the updated post object without tags

- If the post is already deleted or not found, returns:

```js
{ success: true, data: null, message: 'Post already deleted' }
```

In `PostRepository.deletePost`

- Uses `findOneAndDelete` to soft-delete the post by matching \_id and authorId

- Returns a Post instance wrapping the deleted post, or null if no post was found

## Broadcasted Events

When a post is successfully deleted, the server broadcasts the `POST_DELETED event`:

- To the author’s connected sockets

- To all shared users’ connected sockets

This broadcast ensures all relevant users are notified of post deletions immediately.

# Socket Event: GET_TAGS

## Functional Requirements Covered

- _FR8_ – Users can retrieve available tags filtered by name (case-insensitive) and paginated using cursor-based pagination.

## Input Validation

Handled by: _GetTagsValidator_

- name: optional. Filters tags whose names **start with** the provided string. Matching is case-insensitive. If an empty string is provided, no filtering is applied.

- cursor: a 24-character hexadecimal string. It indicates the starting point for fetching the next or previous page of tags. Accepts null or an empty string when starting from the beginning.

- direction: the pagination direction. Can be either 'next' to move forward or 'prev' to move backward from the current cursor position.

- limit: the maximum number of tags to return. Must be an integer greater than or equal to 1

## Success Server Response

Returns a normalized, paginated list of tag names as strings

```js
 {
  success: true,
  data: {
    tags: ["devops"],
    limit: 3,
    direction: "next",
    nextCursor: "6839d0360e843b8cbd7045c1",
    prevCursor: "6839d0360e843b8cbd7045bd"
  }
}
```

- `tags` is an array of strings, each representing a tag's name.

If `nextCursor` points to the last available tag, the next request returns an empty `tags` array, `nextCursor: null`, and a valid `prevCursor`.

## Error Server Response

Example of invalid cursor length:

```js
{
  success: false,
  error: {
    status: 400,
    message: "\"cursor\" length must be 24 characters long"
  }
}
```

## Flow

Handled by: _GetTagsEventHandler_

- Validates the incoming payload using `GetTagsValidator`

- Calls `TagService.getTags()` to retrieve the list of tags based on the validated parameters

- Passes the result to `ListTagsCursorNormalizer` to format the response with pagination

- Sends the normalized result back to the client via the `ack` callback

- In case of errors, logs the error and returns a normalized error response using `errorNormalizer`.

In `TagService.getTags`

- Calls `TagRepository.getTagsByCursor()` to fetch the tags from the database

- Receives and forwards the name, cursor, limit, and direction parameters to the repository layer

- Returns a list of matching tags

In `TagRepository.getTagsByCursor`

Builds a MongoDB query filter:

- If name is provided, applies a case-insensitive $regex filter matching tags starting with the given string

- If a cursor is provided, filters tags by `id` using either `$gt`(for `next`) or `$lt`(for `prev`), depending on the pagination direction

- Sorts results by `id` in ascending (next) or descending (prev) order

- Applies a limit on the number of results returned

## Broadcasted Events

No specific broadcast events triggered by getTags (unlike other actions like creation or sharing).
