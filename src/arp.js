autowatch = 1;

var noteSortMenuItems = ['entry', 'asc', 'desc', 'rnd'];
var octaveSortMenuItems = ['asc', 'desc', 'rnd']; 
var activeNotes = [];

var patchObjectNumOctaves = patcher.getnamed('dial_octave');
var patchObjectNoteSort = patcher.getnamed('menu_notesort');
var patchObjectOctaveSort = patcher.getnamed('menu_octavesort');
var patchObjectNotesColl = patcher.getnamed('notes_to_play');

noteIn.immediate = 1;
function noteIn()
{
	// retrieve note information
	var args = arrayfromargs(arguments);

	var order = args[0];
	var pitch = args[1];
	var velocity = args[2];

	// get index for this pitch
	var index = activeNotes.indexOf(pitch);

	// either store or remove the pressed/released note
	if(velocity > 0)
	{
		// store entry
		if(index >= 0)
		{
			// already exists?! shouldnt happen
			postn('Pitch is already stored: ' + pitch);
		}
		else
		{
			activeNotes.push(pitch)
		}	
	}
	else
	{
		// remove entry
		if (index >= 0)
		{
			activeNotes.splice(index, 1);
		}
		else
		{
			postn('Not found: ' + pitch);
		}
	}

	createArpeggio();
}

createArpeggio.immediate = 1;
function createArpeggio()
{
	// get some data from the interface
	var noteSortMode = noteSortMenuItems[patchObjectNoteSort.getvalueof()];
	var octaveSortMode = octaveSortMenuItems[patchObjectOctaveSort.getvalueof()];
	var selectedOctaves = patchObjectNumOctaves.getvalueof();
	
	// make a copy of the currently active notes
	var orderedNotes = activeNotes.slice();

	switch(noteSortMode)
	{
		case 'entry':
		{
			// do nothing, already ordered on time of entry
			break;
		}
		case 'asc':
		{
			orderedNotes.sort();
			break;
		}
		case 'desc':
		{
			orderedNotes.sort();
			orderedNotes.reverse();
			break;
		}
		case 'rnd':
		{
			postn('Notesort not implemented yet: ' + noteSortMode);
			break;
		}
		default:
		{
			postn('Unknown notesort: ' + noteSortMode);
		}
	}

	// create the actual resulting notes
	
	var resultingNotes = [];
	switch(octaveSortMode)
	{
		case 'asc':
		{
			// loop through octaves
			for(var o = 0; o < selectedOctaves; o++)
			{
				for(var n = 0; n < orderedNotes.length; n++)
				{
					resultingNotes.push(orderedNotes[n] + (o * 12));
				}
			}
			break;
		}
		case 'desc':
		{
			// loop backwards through the octaves
			for(var o = selectedOctaves - 1; o >= 0; o--)
			{
				for(var n = 0; n < orderedNotes.length; n++)
				{
					resultingNotes.push(orderedNotes[n] + (o * 12));
				}
			}
		}
		case 'rnd':
		{
			postn('Octavesort not implemented yet: ' + octaveSortMode);
			break;
		}
		default:
		{
			postn('Unknown octavesort: ' + octaveSortMode);
		}
	}

	// send the result to the coll
	patchObjectNotesColl.message('clear');
	for(var i = 0; i < resultingNotes.length; i++)
	{
		postn(i);
		patchObjectNotesColl.message('store', [i, resultingNotes[i]]);
	}
}

function postn(message)
{
	post('\n' + message);
}

post('js ready');