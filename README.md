# Swipe History Extension for SillyTavern

This extension adds a swipe history feature to SillyTavern. It injects a history button next to AI messages that have multiple swipes, allowing you to view the full swipe history in a popup modal.

## Installation (for Users)

1.  Go to the "Extensions" panel in SillyTavern.
2.  Under "Download Extension", paste the URL of this repository: `https://github.com/dasss1223/SillytarvenSwipes`
3.  Click "Install".
4.  Enable the "Swipe History" extension in the extensions list.

## Local Installation / Development

If you want to install the extension manually or work on it locally, follow these steps.

### 1. Folder Location

Place the entire `swipe-history` folder into the following directory within your SillyTavern installation:

```
SillyTavern/public/extensions/third-party/
```

The final path should be `SillyTavern/public/extensions/third-party/swipe-history`.

### 2. No Build Step Required

This extension is written in plain JavaScript and does not require any build or compilation steps.

### 3. Enable in SillyTavern

1.  Start SillyTavern.
2.  Go to the "Extensions" panel (the puzzle piece icon).
3.  Find "Swipe History" in the list and make sure the checkbox next to it is enabled.
4.  Reload the SillyTavern UI by refreshing your browser.

## Usage

Once installed and enabled, open any chat. For any AI message that has more than one swipe, a small clock icon (<i class="fa-solid fa-clock-rotate-left"></i>) will appear next to the swipe counter. Click this icon to open a popup showing the full history of swipes for that message.
