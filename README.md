# leetcode-scoreboard
Just a simple scoreboard for friends to see each other's progress on LeetCode.


## How was this made?
The user data is fetched from [Leetcode Stats API](https://github.com/JeremyTsaii/leetcode-stats). The username is stored in a [Supabase](https://supabase.io/) database to ensure consistency across all users.

## Host your own
1. Fork this repository.
2. Create an account on [Supabase](https://supabase.io/).
3. Create a new project on Supabase and create a new table with the following schema:
    ```
    Tbale Name: users

    Column:
    - username (type: varchar, primary key)
    ```
4. make sure that your RLS policy is dissabled(although it is not recommended, if you only want to share the project with people you trust, you can disable it).
5. Edit the `script.js` file with your own supabase credentials.
    ```javascript
    const SUPABASE_URL = 'REPLACE_WITH_YOUR_SUPABASE_URL';
    const SUPABASE_KEY = 'REPLACE_WITH_YOUR_SUPABASE_KEY';
    ```
