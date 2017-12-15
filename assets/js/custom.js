const NUM_SECONDS = 10;

const MAPPING_PATH = "assets/data/filename_to_titles.txt";

const SURVEY_ELT = '<iframe src="https://docs.google.com/forms/d/e/1FAIpQLSeLsYHr13R-D1AiyXVVyOYny7ILLMVlxm4ZvGisDV84eQfa8w/viewform?embedded=true&usp=pp_url&entry.1873128544={{name}}&entry.1583728358={{poster}}&entry.1804308406&entry.940646846&entry.893385613&entry.1174309994&entry.1033756814" width="850" height="600" frameborder="0" marginheight="0" marginwidth="0">Loading...</iframe>';
const DEMOGRAPHIC_FORM_ELEMENT = '<iframe src="https://docs.google.com/forms/d/e/1FAIpQLSe7p0ouNtTV86Dj8OkRVem96rEOHg6wHAK6I8eH7duzNjp-3g/viewform?embedded=true&usp=pp_url&entry.1287108143={{name}}&entry.1484470814&entry.950656585&entry.154309458&entry.987865714" width="850" height="600" frameborder="0" marginheight="0" marginwidth="0">Loading...</iframe>';

var NUM_SUBTASKS;

var SEEN_THUMBNAILS = {};

var custom = {
    loadTasks: function() {
        /*
         * This function is called on page load and should implement the promise interface
         *
         * numSubtasks - int indicating what length array to return (how many subtasks this task should have)
         * 
         * returns: if config.meta.aggregate is set to false, an array of objects with length config.meta.numTasks,
         * one object for each task; else, an object that will be made available to all subtasks
         */
        var subject = gup('subject');
        var subjectDataPath = "assets/data/" + subject + "/StudyDir/";
        var files_path = subjectDataPath + "files_to_posters.txt";
        return $.when(
            $.ajax({
                url: files_path, 
                dataType: "text"
            }).then(function(data) {
                return parse_matching_file(data);
            }), 
            $.ajax({
                url: MAPPING_PATH,
                dataType: "text"
            }).then(function(data) {
                return parse_matching_file(data);
            })
        ).then(function(files_to_posters, posters_to_names) {
            var tasks = []
            for (var file in files_to_posters) {
                var filepath = subjectDataPath + file;
                var poster = files_to_posters[file].trim();
                var name = posters_to_names[poster];
                tasks.push([filepath, name]);
            }
            var numSubtasks = tasks.length;
            NUM_SUBTASKS = numSubtasks;
            shuffleArray(tasks);
            preload_images(tasks);
            createSurveys(tasks);
            return [numSubtasks + 2, tasks];
        })
    },
    showTask: function(taskInput, taskIndex, taskOutput) {
        /*
         * This function is called when the experiment view is unhidden 
         * or when the task index is changed
         *
         * taskInput - if config.meta.aggregate is false, the object in the array from loadTasks
         *   corresponding to subtask taskIndex; else, the input object from loadTasks
         * taskIndex - the number of the current subtask
         * taskOutput - a partially filled out task corresponding to the subtask taskIndex
         *   If config.meta.aggregate is set to false, this is the results object for the current
         *   subtask. If config.meta.aggregate is set to true, this is the results object for the
         *   entire task. 
         * 
         * returns: None
         */
        $('.subtask').hide();

        // callback that shows the google form
        function formCallback() {
            $('.poster-form').hide();
            $('#show-thumbnail').hide();
            $('.instruction-button').show();
            $('#do-study-subtask').show();
            $('#poster-form-' + taskIndex).show();
            $('#next-button').show();
            $('#prev-button').show();
        }

        //special case for the demographic survey 
        if (taskIndex == NUM_SUBTASKS) {
            var name = gup('subject');
            name = name.charAt(0).toUpperCase() + name.slice(1); // make the name uppercase
            name = encodeURIComponent(name);
            var demoSurvey = DEMOGRAPHIC_FORM_ELEMENT.replace("{{name}}", name);
            $('#demographic-form').append($(demoSurvey));
            $('#demographic-form').show();
            return;
        } else if (taskIndex == NUM_SUBTASKS + 1) {
            $('#done').show();
            return;
        }

        if (SEEN_THUMBNAILS[taskIndex]) {
            // just show the survey 
            formCallback();
        } else {
            // show the gif and everything 
            $("#prev-button").show();
            var imSource = taskInput[0];
            var studyTitle = taskInput[1];
            // load the correct image
            $("#thumbnail-container img").attr("src", imSource);

            $('#confirm-show-gif').show();
            $('#prev-button').hide();
            $('#next-button').hide();

            $('.num-seconds').text(NUM_SECONDS);

            // Set up a callback that shows the graph and timer 
            $('#show-thumbnail-button').click(function() {
                SEEN_THUMBNAILS[taskIndex] = true;
                $('#next-button').hide();
                $('#prev-button').hide();
                $('.instruction-button').hide();
                $('#confirm-show-gif').hide();
                $('#show-thumbnail').show();
                var timer = $('#thumbnail-timer');
                runTimer(NUM_SECONDS-1, timer, formCallback);
            })
        }
    },
    collectData: function(taskInput, taskIndex, taskOutput) {
        /* 
         * This function should return the experiment data for the current task 
         * as an object. 
         *
         * taskInput - if config.meta.aggregate is false, the object in the array from loadTasks
         *   corresponding to subtask taskIndex; else, the input object from loadTasks
         * taskIndex - the number of the current subtask 
         * taskOutput - outputs collected for the subtask taskIndex
         *   If config.meta.aggregate is set to false, this is the results object for the current 
         *   subtask. If config.meta.aggregate is set to true, this is the results object for the
         *   entire task.
         *
         * returns: if config.meta.aggregate is false, any object that will be stored as the new
         *   taskOutput for this subtask in the overall array of taskOutputs. If
         *   config.meta.aggregate is true, an object with key-value pairs to be merged with the
         *   taskOutput object.
         */
        return;
    },
    validateTask: function(taskInput, taskIndex, taskOutput) {
        /*
         * This function should return an error message if the 
         * data stored in taskOutput is not valid (e.g. fully filled out), and 
         * a falsey value otherwise
         *
         * taskInput - if config.meta.aggregate is false, the object in the array from loadTasks
         *   corresponding to subtask taskIndex; else, the input object from loadTasks
         * taskIndex - the number of the current subtask 
         * taskOutput - outputs collected for the subtask taskIndex
         *   If config.meta.aggregate is set to false, this is the results object for the current 
         *   subtask. If config.meta.aggregate is set to true, this is the results object for the
         *   entire task
         * 
         * returns: string indicating error message or falsey value
         */
        //  make sure they have submitted the Google form 
        return;
    }
};

function gup(name) {
    var regexS = "[\\?&]"+name+"=([^&#]*)";
    var regex = new RegExp( regexS );
    var tmpURL = window.location.href;
    var results = regex.exec( tmpURL );
    if (results == null) return "";
    else return results[1];
}

function runTimer(timeLeft, timer, callback) {
    //timer is the jquery object representing the timer UI object 
    var delay = 1000;
    if (timeLeft >= 0) {
        setTimeout(runTimer.bind(this, timeLeft - 1, timer, callback), delay);
        var timeString = timeLeft < 10 ? '0' + timeLeft.toString() : timeLeft.toString();
        timer.find('.timeleft').text(timeString);
        if (timeLeft == 0) {
            timer.removeClass('primary').addClass('red');
        }; 
    } else {
        // reset the timer
        timer.removeClass('red').addClass('primary');
        if (callback) {
            callback();
        }
    }
}

function shuffleArray(array) {
    for (var i = array.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
}

function parse_matching_file(str) {
    str = str.trim();
    var pairings = str.split("\n");
    var mapping = {}
    pairings.forEach(function(elt, i) {
        var arr = elt.split(", ");
        mapping[arr[0]] = arr[1];
    })
    return mapping;
}

function preload_images(data) {
    data.forEach(function(elt, i) {
        var img = new Image();
        img.src = elt[0];
    });
}

function createSurveys(tasks) {
    tasks.forEach(function(elt, i) {
        var container = $('#poster-form-container');
        var surveyElt = $('<div class="poster-form" id="poster-form-' + i +'"></div>')

        name = gup('subject');
        name = name.charAt(0).toUpperCase() + name.slice(1); // make the name uppercase
        name = encodeURIComponent(name);

        posterName = elt[1];
        posterName = encodeURIComponent(posterName);
        survey = SURVEY_ELT.replace("{{name}}", name);
        survey = survey.replace("{{poster}}", posterName);
        // add survey as a dom element
        surveyElt.append($(survey));
        container.append(surveyElt);
    });
}

// function embedSurvey(posterName) {
//     name = gup('subject');
//     name = name.charAt(0).toUpperCase() + name.slice(1); // make the name uppercase
//     name = encodeURIComponent(name);
//     posterName = encodeURIComponent(posterName);
//     survey = SURVEY_ELT.replace("{{name}}", name);
//     survey = survey.replace("{{poster}}", posterName);
//     // add survey as a dom element
//     $('#poster-form').append($(survey));
// }
