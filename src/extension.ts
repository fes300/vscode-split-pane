// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

const getActiveEditor = () => {
	const activeEditor = vscode.window.activeTextEditor;

	if(!activeEditor) {
		throw new Error("no activeEditor in scope");
	}

	return activeEditor;
};

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "split-pane" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerCommand('splitDig.openInNewSplit', () => {
		// The code you place here will be executed every time your command is executed

		const activeEditor = getActiveEditor();

		return vscode.commands.executeCommand<vscode.Location[]>(
			'vscode.executeDefinitionProvider',
			activeEditor.document.uri,
			activeEditor.selection.active
		).then(definitions => {
			const uri = definitions && definitions[0] && definitions[0].uri;
			const range = definitions && definitions[0] && definitions[0].range;

			if(!uri || !range) {
				throw new Error("no definition in scope");
			}

			vscode.commands.executeCommand("explorer.openToSide", uri)
				.then(() => {
					return vscode.commands.executeCommand("editorScroll", { to: "down", by: "line", value: range.start.line });
				})
				.then(() => {
					const editor = getActiveEditor();
					const position = editor.selection.active;
					const newPosition = position.with(range.start.line, range.start.character);
					const newSelection = new vscode.Selection(newPosition, newPosition);
					editor.selection = newSelection;
				});
		});
	});

	context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() {}
