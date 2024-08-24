
> ⚠️ **Warning**
> \
> This script has been tested on macOS Sonoma 14.1. While it should work on other operating systems, please be aware that there might be slight differences in behavior or performance on other platforms.

# Merger

Merger is a TypeScript script that recursively iterates through files in the current directory and merges them into a single file. This tool is particularly useful when working with Large Language Models (LLMs) to consolidate the contents of a repository into a single context.

## Features

- Recursive file traversal
- Merges text files into a single output
- Ignores binary files and common non-text formats
- Supports custom ignore patterns via `.mergeignore` file
- Automatically skips common directories (e.g., `.git`, `node_modules`)
- Optional logging of results to console

## Usage

To run the script and generate the merged output file:

```
bun merge.ts --path /path/to/directory
```

To run the script and log the results to the console without creating a file:

```
bun merge.ts --log
```

The `--log` option will display the merged content in the console instead of writing it to a file.

## Keyboard Maestro Macro

This script can be easily integrated into your workflow using a Keyboard Maestro macro. This allows you to trigger the merge operation with a simple keyboard shortcut or other automation triggers.

<img src="https://cloud.overment.com/2024-08-24/merger_macro-8c5ba94f-8.png" alt="Keyboard Maestro Macro for Merger" width="600">

You can download the Keyboard Maestro macro [here](https://cloud.overment.com/Merge-Files-From-the-Current-Directory-1724508285.kmmacros).

### Important Notes:

1. **Username Modification**: Before using the macro, you need to modify the macOS directory paths in the macro to match your username. Look for instances of `/Users/yourusername/` and replace `yourusername` with your actual macOS username.

2. **File Permissions**: Ensure that the `index.ts` file has the necessary write permissions. You can do this by running the following command in your terminal:

   ```
   chmod +w index.ts
   ```

   This command gives write access to the `index.ts` file.

3. **Bun Installation**: Make sure that Bun is installed and properly set up. Keyboard Maestro requires the full path to the Bun installation folder. You can get this path by running the `which bun` command in your terminal. Use the output of this command in the Keyboard Maestro macro where it calls Bun.

## Output

By default, the script generates a `merged_output.md` file containing the merged contents of all text files in the current directory and its subdirectories. When using the `--log` option, the output is displayed in the console.

## Ignored Files and Directories

By default, the script ignores:

- Binary files (e.g., images, executables, archives)
- Common non-text formats (e.g., PDFs, Office documents)
- Specific files like `.DS_Store`
- Common directories such as `.git`, `node_modules`, `dist`, etc.

## Custom Ignore Patterns

You can create a `.mergeignore` file in the same directory as the script to specify additional ignore patterns. Each line in this file represents a pattern to ignore. For example:

```
*.log
temp/*
secret.txt
```

Patterns support wildcards (`*`) and are matched against the relative path of each file.

## Output Format

The merged output wraps each file's content in XML-like tags:

```xml
<file location="path/to/file" name="filename.ext">
File content goes here
</file>
```

This format allows for easy parsing and identification of individual files within the merged output.

## Requirements

- [Bun](https://bun.sh/) runtime

## Limitations

- Large repositories may result in a very large output file or console output
- Binary files are skipped to avoid corruption and maintain readability

## Contributing

Feel free to submit issues or pull requests to improve the script or documentation.