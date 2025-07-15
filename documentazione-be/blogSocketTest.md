# Socket Blog Operations Test

This document provides integration tests for verifying blog post creation functionality through socket events.

These tests ensure:

- Successful post creation by an authenticated user

- Proper event emission (POST_SHARED, POST_CREATED) to the relevant users

- Validation and error handling for invalid payloads

## Requirements

- The test user must have status: ACTIVE

- A valid JWT token must be included in the client's authentication payload

- The socket server must be running at:
  http://localhost:8026/multiuserblog

## Utilities

### Helpers

- TestUtils.createTestUser(status): Creates a test user with the given status
- TestUtils.createTestTag(name): Creates a tag with the specified name
- TestUtils.generateTestPostData(authorId, tags): Generates a valid post payload
- TestUtils.getPostById(id): Retrieves a post from the database by its Id
- TestUtils.restore(): Cleans up test data after each test

### Fixtures

- SocketFixtures.createClient(user): Creates a socket client authenticated with the given user

## Test: Create Post - Success Case

Verifies that an authenticated user can create a post with valid data including title, content, publish date and tags.

### Assertions

- Response has success: true
- Returned data matches the input (title, content, author, publish date)
- Tags are correctly associated
- Post is persisted in the DB

## Socket Actions & Events

## Emitted Events

- `POST_CREATED`: Sent to the author after a successful post creation

- `POST_SHARED`: Sent to users the post is shared with

## Socket Action

- `CREATE_POST`: emitted by client to create a new post

## CREATE POST TESTS

## SUCCESS CASE

Verifies that an authenticated user can create a post with valid data including title, content, publish date, and tags.

### Assertions

- Response has `success: true`
- Returned fields matche input (title, content, authorId, publishDate as ISO string)
- Tags are correctly associated and returned as an array
- The post is correctly stored in the database

## POST_SHARED Event Emission

Ensures shared users receive `POST_SHARED` notification

### Assertions

- Shared user receives the event with the correct data
- Unrelated clients do not receive the `POST_SHARED` event
- Payload includes: title, content, authorId, userIds, publishDate (ISO), tags

## POST_CREATED Notification

Ensures author receives `POST_CREATED` event on successful post creation.

### Assertions

- Author receives correct post data
- userIds array includes all relevant users
- Tags are included and correct

## Test: Create Post - Failure Cases

Verifies that the server responds with proper validation errors when the payload is malformed or incomplete. Each failure test expects success: false, an error object with HTTP status code and an appropriate error message.

### Covered Cases:

- Empty payload - (400)
- Missing title - (400)
- Title < 3 chars - (400)
- Missing content - (400)
- Content < 3 chars - (400)
- Publish date is in the past - (400)
- tags is not an array - (400)
- Empty tag string - (400)
- image is not a valid string - (400)
- Invalid user session - (401)

Use synchronization utilities such as eventSynchronizer to wait for asynchronous events in tests before asserting results.

## UPDATE POST TEST

These tests verify the functionality of the Update Post feature through socket communication (`UPDATE_POST event`). They cover both successful updates and various failure cases due to invalid inputs or missing posts.

## Utilities

- Use _PostTestUtils_ to create test users, tags, and posts
- Use _SocketFixtures_ to create socket clients connected as test users
- After each test, _PostTestUtils.restore()_ is called to clean up

## SUCCESS CASE

`Update Post with Valid Data`

- Create a test user.
- Create multiple tags.
- Generate a test post linked to those tags.
- Emit`UPDATE_POST` with new title, content, publishDate (future) and tags.

### Assertions

- Response has `success: true`
- Returned data matches input (title, content, authorId)
- `publishDate` is correctly converted to ISO string and returned
- Tags are correctly associated and returned as an array with correct tag names
- The post is correctly updated in the database

## Failure Cases

Verifies that the server responds with proper validation errors when the payload is malformed or incomplete. Each failure test expects success: false, an error object with an HTTP status code, and an appropriate error message.

### Covered Cases

- Post not found - (404)
- Invalid postId - (400)
- Title too short (< 3 characters) - (400)
- Content too short (< 10 characters) - (400)
- Publish date in the past - (400)
- Tags not an array - (400)
- Tags contain empty string elements - (400)

## DELETE POST TEST

These tests verify the functionality of the Delete Post feature through socket communication (`DELETE_POST event`). They include both successful deletion and various failure cases related to invalid inputs and authentication.

## Utilities

- Use _PostTestUtils_ to create test users, tags and posts

- Use _SocketFixtures_ to create socket clients connected as test users

- After each test, _PostTestUtils.restore()_ is called to clean up

## SUCCESS CASE

`Delete Post with Valid Data`

- Create a test user
- Create multiple tags
- Generate a test post linked to those tags
- Emit `DELETE_POST` with a valid postId belonging to the test user

### Assertions

- Response has `success: true`
- Returned data contains the correct post info (tags is an empty array)
- The post remains in the database with status = DELETED
- Tags still exist in the database (they are not deleted, only dissociated)

` Delete Already Deleted Post (idempotent)`

The delete operation is idempotent: attempting to delete an already-deleted post does not raise an error.

### Assertions

- The second deletion still returns success: true
- The response contains
  - data: null
  - message: 'Post already deleted'

## Failure Cases

These tests ensure the server properly handles invalid delete requests by returning success: false, a relevant HTTP status code and a descriptive error message.

### Covered Cases

- Invalid postId format (non-hex string) (400)
- postId not provided (400)
- postId has incorrect length (not 24 characters) (400)
- User is not authenticated (401)

`Post Deletion Notification`

When a post is deleted, the server emits a `POST_DELETED event` to notify relevant connected clients via WebSocket:

- _To the post owner’s active sockets_ — all sockets connected as the author of the deleted post

- _To shared users’ active sockets_ — all sockets connected as users with whom the post is shared (userIds list)

The event payload contains the normalized post data reflecting the deleted status and updated fields (empty tags array).

## GET TAGS TEST

These tests verify the functionality of fetching tags through socket communication (`GET_TAGS event`). They cover successful retrieval with filtering, pagination, and failure cases with invalid inputs.

## Utilities

- Use `PostTestUtils` to create test users and tags

- Use `SocketFixtures` to create socket clients connected as test users

- After each test, `PostTestUtils.restore()` is called to clean up

## SUCCESS CASES

`Get Tags with Filtering and Pagination`

- Create multiple test tags

- Emit `GET_TAGS` with a case-insensitive name filter

- Verify only tags matching the filter are returned

- Verify pagination using nextCursor and prevCursor cursors

- Test different limits to verify the number of tags returned

- Navigate between next and previous pages using cursors

- If the `nextCursor` points to the last available tag, the next request returns an empty array, `nextCursor: null`

### Assertions

- Response has success: true
- Returned tags are an array and match the filter criteria
- Pagination cursors (nextCursor, prevCursor) are present and correct
- Number of tags returned respects the specified limit
- Tags from different pages do not overlap

## FAILURE CASES

These tests ensure the server properly handles invalid requests by returning success: false, an appropriate HTTP status code, and a descriptive error message.

### Covered Cases

- Invalid cursor (400)
- Invalid direction (not next or prev) (400)
- Negative or non-numeric limit (400)
- Cursor with invalid length (400)
- Name filter not a string (400)

## CREATE COMMENT TEST

This test suite verifies the functionality of creating comments via socket communication (`CREATE_COMMENT event`). It covers both success and failure cases, including notifications to shared users and the post owner.

## SUCCESS CASES

_Successful comment creation_

- data.success is true
- Creates a valid comment for an existing post (text, authorId, postId as object with \_id, title, authorId, total_comments, and created_at)
- postId includes `total_comments` set to 1
- Verifies the saved comment matches the input data

_Notify shared users about new comment_

- When a comment is created on a shared post, all shared users receive a `COMMENT_SHARED event`
- Ensures only shared users receive the notification

_Event data includes_:

-text
-postId: { \_id, title, authorId , total_comments}
-authorId
-authorUsername
-created_at
-userIds includes the shared user IDs

_Notify owner sockets_

- Verifies all owner sockets receive the `COMMENT_CREATED event`
- Confirms the list of notified users includes the owner and shared users

_Event data contains_:

- text
- postId { \_id, title, authorId, total_comments }
- authorId
- authorUsername
- created_at

## FAILURE CASES

These tests ensure the server handles invalid input correctly by returning appropriate errors and HTTP status codes.

- `data.success` is `false`
- `data.error.message` contains a descriptive error explaining the failure (`"postId" is required`)

### Covered Cases

- Missing postId (400)
- Missing text (400)
- Empty text (400)
- Missing authorId (400)
- Invalid postId length (400)
- Unauthenticated users (401)
- Post not found (404)

### Comment Creation Payload

```js
{
  postId: "642f9e8a77d2f2a5d6e3e8b1",
  text: "Test comment",
  authorId: "683b4be760f1e79a4255b8e5"
}
```

## UPDATE COMMENT TEST

This test suite verifies the functionality of updating comments via socket communication (`UPDATE_COMMENT event`). It covers both success and failure cases, ensuring that only the comment’s author can modify the comment.

## SUCCESS CASES

_Successful comment update_

- data.success is true

- Updates an existing comment with new text

- Returns the updated comment data including:

  - \_id (comment ID)
  - text (updated content)
  - authorId
  - postId (object with \_id, title, and authorId)
  - authorUsername
  - created_at timestamp

Verifies the updated comment in the database matches the new input text.

## FAILURE CASES

These tests ensure the server handles invalid input correctly by returning appropriate errors and HTTP status codes.

- `data.success` is `false`

- `data.error.message` contains a clear description of the failure

### Covered cases:

- Invalid commentId format (length not 24 characters) — (400)
- text field is not a string — (400)
- text field is empty — (400)
- Comment with the given commentId does not exist — (404)
- Unauthenticated users (401)

## Comment Update Payload

```js
{
  commentId: "642f9e8a77d2f2a5d6e3e8b1",
  text: "Updated comment text"
}
```

## Delete Comment Test

This test suite verifies the functionality of deleting comments through socket communication using the `DELETE_COMMENT event`. It covers both success and failure cases to ensure:

- Comments are properly removed from the database
- The associated post’s total_comments is decremented
- The appropriate events and responses are sent to clients

### Test Suite Structure

Setup :

_beforeEach_:

- Creates a test user (testUser).

- Creates two socket clients (client, client2) connected as that user

_afterEach_:

- Restores the database to a clean state after each test

## SUCCESS CASES

`Deletes comment, updates post total_comments and emits POST_UPDATED event`

- A comment is created for testUser

- The `DELETE_COMMENT event` is emitted with the correct commentId

- Response contains { deleted: true } and the deleted comment data

- `POST_UPDATED event` is received by a second connected socket client

- The updated post has `total_comments = 0`

- Database no longer contains the deleted comment

- The post’s total_comments field reflects the deletion

## Behavior Verified

- The comment is removed from the database

- The post’s total_comments count is decremented

- A `POST_UPDATED event` is emitted to all relevant clients (post `userIds`) with the updated post data.

## FAILURE CASES

These tests ensure the server handles invalid input correctly by returning appropriate errors and HTTP status codes.

- `data.success` is `false`

- `data.error.message` contains a clear description of the failure

### COVERED CASES

- Invalid commentId format (length not 24 characters) — (400)

- Unauthenticated users — (401)

- Comment with the given commentId does not exist
  `Returns { deleted: false, success: false }`

## Comment Delete Payload

```js
{
  commentId: '683df1e3663dac33d2e0033a';
}
```

## Toggle Like Test

This test suite verifies the functionality of toggling likes on posts via socket communication (`TOGGLE_LIKE event`). It ensures that users can like and unlike posts, and that the like state is reflected correctly in the post's total_likes value and across connected clients via LIKE_TOGGLED events.

### Test Suite Structure

Setup :

_beforeEach_:

- Restores the test database to a clean state

- Creates a test user (testUser)

- Initializes two socket clients (client, client2) connected as the same user

_afterEach_:

- Restores the database state after each test

## SUCCESS CASES

`Toggles like and emits LIKE_TOGGLED event`

- Creates a new test post

- Emits the `TOGGLE_LIKE` event from client

- Expects a successful response with `total_likes = 1`

- client2 listens for the `LIKE_TOGGLED event`

- Verifies the event contains correct post ID and that the `liked_by` field is an **array of user IDs** including the liker, with updated `total_likes = 1`

- Confirms from the database that the post's total_likes and `liked_by` array are updated accordingly

` Removes like if already liked (toggle off)`

- Toggles a like from client to set `total_likes = 1`

- Emits `TOGGLE_LIKE again` from client2 to remove the like

- Expects total_likes = 0 in the response

- Listens for `LIKE_TOGGLED event` and verifies the data

- Confirms from the database that the post's `total_likes = 0`

## Behavior Verified

- Toggling likes on a post increases or decreases total_likes

- The post correctly reflects the user's like status in its liked_by array of user Ids

- A LIKE_TOGGLED event is emitted to all relevant clients

- The post in the database remains consistent with emitted event data

## FAILURE CASES

These tests ensure the server handles invalid input correctly by returning appropriate errors and HTTP status codes.

- `data.success` is `false`

- `data.error.message` provides a clear reason for the failure

- `data.error.status` contains the correct status code

### COVERED CASES

- Invalid postId format (not 24 characters) — (400)

- postId too short — (400)

- postId too long — (400)

- Unauthenticated user — (401)

## Toggle Like Payload

```js
{
  postId: '68406fe4050e65ba4a16a0c9';
}
```
