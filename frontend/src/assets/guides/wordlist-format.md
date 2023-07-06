To import a wordlist, you must upload a json file having the structure below:

```javascript
{
  "name": "The name of the wordlist",
  "description": "Some description for the wordlist (optional)"
  "wordlist": [
    "word1", "word2", "word3"
  ]
}
```
The wordlist items must be unique.

If you want to import equivalences, the wordlist items must have the following format:

```javascript
"{term}:{equivalence}"
```

For example:

```javascript
{
  "wordlist": [
    "huge:enormous",
    "small:little"
  ]
}
```