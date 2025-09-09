function calculate() {
  const input = document.getElementById("amountInput").value;
  let amount = parseInt(input, 10);

  if (isNaN(amount) || amount <= 0) {
    document.getElementById("output").innerHTML = "<p>Please enter a positive number.</p>";
    return;
  }

  const denominations = [200, 100, 50, 20, 10, 5, 1];
  let outputHTML = "";

  denominations.forEach(nominal => {
    let count = Math.floor(amount / nominal);
    amount %= nominal;

    if (count > 0) {
      // group all notes of same denomination in one stack
      // adjust maxNotesPerStack if you want multiple smaller stacks
      const maxNotesPerStack = 5;
      const fullStacks = Math.floor(count / maxNotesPerStack);
      const remainingNotes = count % maxNotesPerStack;

      for (let i = 0; i < fullStacks; i++) {
        outputHTML += createStack(nominal, maxNotesPerStack);
      }
      if (remainingNotes > 0) {
        outputHTML += createStack(nominal, remainingNotes);
      }
    }
  });

  document.getElementById("output").innerHTML = outputHTML;
}

function createStack(nominal, count) {
  const stackHeight = 160 + (count - 1) * 8;
  let stackHTML = `<div class="note-stack" style="height:${stackHeight}px">`;
  for (let i = 0; i < count; i++) {
    stackHTML += `<img src="img/${nominal}.png" alt="${nominal} note" style="top:${i*8}px;">`;
  }
  stackHTML += `</div>`;
  return stackHTML;
}
