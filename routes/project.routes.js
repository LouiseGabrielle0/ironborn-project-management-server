const router = require("express").Router();

const { default: mongoose } = require("mongoose");
const Project = require('../models/Project.model');
const Task = require('../models/Task.model');


const {isAuthenticated} = require("../middleware/jwt.middleware")


// Create new project
router.post('/projects', isAuthenticated, (req, res, next) => {
    const { title, description } = req.body;

    const newProject = {
        title,
        description,
        tasks: []
    }

    Project.create(newProject)
        .then(response => res.status(201).json(response))
        .catch(err => {
            console.log("error creating a new project", err);
            res.status(500).json({
                message: "error creating a new project",
                error: err
            });
        })
});


// Get list of projects
router.get("/projects", (req, res, next) => {
    Project.find()
        .populate("tasks")
        .then(response => {
            res.json(response)
        })
        .catch(err => {
            console.log("error getting list of projects", err);
            res.status(500).json({
                message: "error getting list of projects",
                error: err
            });
        })
});



//  Get details of a specific project by id
router.get('/projects/:projectId', (req, res, next) => {
    
    const { projectId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(projectId)) {
        res.status(400).json({ message: 'Specified id is not valid' });
        return;
    }


    Project.findById(projectId)
        .populate('tasks')
        .then(project => res.json(project))
        .catch(err => {
            console.log("error getting details of a project", err);
            res.status(500).json({
                message: "error getting details of a project",
                error: err
            });
        })
});


// Updates a specific project by id
router.put('/projects/:projectId', (req, res, next) => {
    const { projectId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(projectId)) {
        res.status(400).json({ message: 'Specified id is not valid' });
        return;
    }

    // const newDetails = {
    //     title: req.body.title,
    //     description: req.body.description,
    //     tasks: req.body.tasks
    // }

    Project.findByIdAndUpdate(projectId, req.body, { new: true })
        .then((updatedProject) => res.json(updatedProject))
        .catch(err => {
            console.log("error updating project", err);
            res.status(500).json({
                message: "error updating project",
                error: err
            });
        })
});


// Delete a specific project by id
router.delete('/projects/:projectId', (req, res, next) => {
    const { projectId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(projectId)) {
        res.status(400).json({ message: 'Specified id is not valid' });
        return;
    }
    // let tasks
    Project.findByIdAndRemove(projectId)
        .then(deletedProject => { 
            // tasks = deletedProject.tasks.length
            console.log(deletedProject);
        
            // return (tasks > 0 ? Task.deleteMany({ _id: { $in: deteletedProject.tasks } }): (deletedProject))
            return Task.deleteMany({ _id: { $in: deletedProject.tasks } });
        })
        .then(() => res.json({ message: `Project with id ${projectId} & all associated tasks were removed successfully.` }))
        .catch(err => {
            console.log("error deleting project", err);
            res.status(500).json({
                message: "error deleting project",
                error: err
            });
        })
});



module.exports = router;
