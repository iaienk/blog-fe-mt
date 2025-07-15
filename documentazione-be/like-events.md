# Socket Event: TOGGLE_LIKE

## Functional Requirements Covered

- _FR13_ – Logged-in users can like or unlike any post

- _FR14_ – A user can like a post only once

- _FR15_ – The total number of likes for each post must be stored and accessible

## Event Purpose

The `TOGGLE_LIKE socket event` allows an authenticated user to like or unlike a post. If the user has already liked the post, the like will be removed; otherwise, it will be added. The server updates the post accordingly and notifies all relevant users in real-time to keep all clients in sync.

## Authentication

This event requires a valid JWT token. The userId is extracted from the authenticated session:
`this.user.sub`
The server validates the format of this ID to ensure security before proceeding.

## Payload Example

```js
{
  "postId": "68406fe4050e65ba4a16a0c9"
}
```

## Input Validation

Handled by: _ToggleLikeValidator_

- postId: required a 24-character hexadecimal string

If the input is invalid, the server throws a BadRequestException with a descriptive error message.

## Success Server Response

On success, the server returns:

```js
{
  'success': true,
  'data': {
    'id': '6841512506e6acbf8bfa2a66',
    'total_likes': 1,
    'liked_by': [ '6841512506e6acbf8bfa2a5d' ]
  }
}

```

## Error Server Response

If the request fails due to invalid input or other issues:

```js
{
  "success": false,
  "error": {
    "code": 400,
    "status": 400,
    "message": "\"postId\" is required"
  }
}
```

## Flow

The event is handled by the `ToggleLikeEventHandler class`, which listens for the TOGGLE_LIKE event and performs the following steps:

- _Authentication & Validation_: Ensures the user is authenticated and the provided payload is valid

- _Delegation to Business Logic_: The handler delegates the logic to `LikeService`, which internally uses the ToggleLikeCommand to encapsulate the toggling process.

- _Real-Time Feedback_: After processing, the updated post data is sent back to the initiating client and broadcasted to all other relevant clients connected to the post.

_LikeService_:

The `LikeService.toggleLike method` acts as the main entry point to the like toggling process. It:

- Accepts a post ID and user ID

- Constructs and executes a ToggleLikeCommand to handle the actual business logic

- Returns the updated post, including the new like count and the current list of users who liked it

_ToggleLikeCommand_

The `ToggleLikeCommand class` encapsulates all the logic needed to toggle a like on a post. Its responsibilities include:

- _Post Existence Check_: Verifies the post exists using postRepository.findById, throwing an exception if not found

- _Like State Evaluation_: Uses likeRepository.exists to check if the user has already liked the post

- _Toggling Action_:

  - If the post is already liked, it removes the like and decrements the like count

  - If the post is not yet liked, it adds the like and increments the like count

- _Post Update & Return_: After toggling, it fetches the updated post and compiles a fresh list of user IDs who liked it (liked_by). The final post data, including `total_likes` and `liked_by`, is then returned.

_LikeRepository_:

Manages database operations related to likes on posts:

- `exists(postId, userId)`: Checks if a given user has already liked the post

- `create(postId, userId)`: Adds the user to the post's liked_by array

- `findLikeByPostId(postId)`: Returns a list of all user IDs who have liked the post.

- `remove(postId, userId)`: Removes the user from the post's liked_by array

All methods handle MongoDB errors and raise specific exceptions for missing posts or failed operations.

## Broadcasted Events

Once the toggle action is completed, a `LIKE_TOGGLED event` is emitted:

- To the user who triggered the action

- To all users connected to the post

This keeps the post's like state consistent across all active clients in real-time.
