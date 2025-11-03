Welcome to episode number 913. My guest in today's episode is Julien Launay. He is unbelievably knowledgeable about training LLMs, the pre-training part, the post-training part.

We spend tons of time talking about that so you can get a full understanding of how cutting edge AI models are made and how his startup, AdaptiveML, allows enterprises to have fine-tuned models for their particular use case, available much more easily than ever before. This episode of Super Data Science is made possible by Dell, NVIDIA, and AWS. Julien, welcome to the Super Data Science Podcast.

Thank you very much. Happy to be here today.

Yeah, it's great to have you in person in New York.

Totally, yeah.

And so, it doesn't sound like you have a New York accent though.

I don't, I don't. I come from France. I'm spotted within the first few minutes.

I come from France. I actually moved to New York just a few months ago. So it's very recent for me.

I think just over two months today.

Welcome. How are you finding it?

It's really good. I think, you know, people ask me this a lot. And I think it's an interesting question because I think it would be really hard not to enjoy New York.

Like, I feel, every time I feel very boring saying, oh, it's really good, it's really good. Because I don't really know honestly what negative things say. It's an amazing city.

I think it's basically infinite because of its size. You know, the restaurant turnover, new galleries opening. There's always new things to be doing.

But I think especially in your first few months like this, it's so exciting because you're like, wow, a neighborhood like this. I had no idea it existed.

Yeah, it's really amazing. Very diverse, lots of stuff to do. Like, it's kind of endless.

Like, there is always activity. Like, it's super nice. Really, really nice place.

Nice. And so speaking of exploration, you're actually, you're a guest on the show because you wrote a bestselling book.

Absolutely.

Ten years ago called Aventure, Survives and Creation, The Guide to Minecraft. So it's a Minecraft guide that you wrote in high school, is that right?

Exactly. In high school, so I used to play way too much Minecraft, I guess like many people of my generation. So maybe it was a new generation, but it's making a comeback.

And I used to write for a website called minecraft.fr, so French domain. And one day, Pearson's editor contacted us and was like, oh, we could to do a guidebook. So it's having a lot of success and ended up being part of this project.

And surprisingly, it ended up becoming, I think, the year it came out, it ended up becoming one of the best seller in French, which is really funny because I can say that I wrote the best seller in French. Well, it's a video game book, so your mileage may vary, but.

And this actually, this book didn't actually show up in our research of you, but you mentioned it before we started recording. However, it is kind of interesting because this kind of got, did this get you interested in programming kind of in the first place?

Yeah, yeah. So not so much a book per se, but definitely Minecraft definitely got me into programming, like plugins and mods, all of that sort of stuff. I used to run a few servers, a few very large servers with a fund.

And this was also, I think, very interestingly, this was a time where Minecraft kind of professionalized, where there was starting to be like a very large server with tens of thousands of players that started making a lot of money actually on the side, kind of like the ecosystem started picking up, which in itself, by the way, is an entirely other story. I think like the world of Minecraft is actually fascinating even from like a business perspective and how it grew and all of that. But yes, that was very much the beginning of this and ended up doing some modding, some more of that, so learning Java, like doing this and spending once again too much time on this.

Maybe school performance dropped a bit because of that. But in the end, it all worked out.

Yeah, it seems to be paying off. You are co-founder now and CEO of a firm called AdaptiveML, who are makers of something called the Adaptive Engine, a flywheel for enterprise AI which continuously evaluates, tunes and serves large language models, LLMs, so they are uniquely adapted to a business using smaller cost-efficient models. Before we get too much into Adaptive, your company, I'd love for you to talk about, based on your rich experience at Hugging Face, also at a company called Lighton that we'll talk a lot about more later in the episode, through that experience, you have tons of experience in creating LLMs that are useful for real life and at the biggest scale that LLMs come.

I'd love for you to start off by providing us with an overview of the steps involved in creating an LLM like pre-training and reinforcement learning.

Yeah, I am. It's a very timely question as well, given that I think these steps are blending a bit these days, so take everything that I say with a grain of salt. There's always nuance in this, but very broadly speaking, the way that historically large language models have been approached, first is through a pre-training phase, which is the bulk, historically, of where the computer has been spent.

Pre-training is during pre-training, we essentially collect data from all over the web, pretty much every book, every paper, but not nearly at the scale of modern pre-training, nearly every text in existence. I think it sounds very grandiose, but it's not far from being true, and even nowadays, images, videos, and all of this. Essentially, the model is trained to very roughly predict the next world, predict the next token.

This is a step that is built to be scalable, to run at scale that are essentially everything we have ever produced on tens or hundreds of thousands of GPUs these days. But pre-training is only a first step because immediately after pre-training, models are actually a bit unwieldy. If you take really pure pre-training and you try your model immediately after, it's not going to be very interactive with you.

It's not going to be chatty. It's not going to answer your questions necessarily in the way that you expect. I think a failure mode that we used to see a lot immediately after pre-training is, let's say I ask a model a question, and instead of answering the question, the model will come up with ten more questions that are similar.

The reason why is because in its pre-training data, this is equally likely to have a list of the question as to have the answer following the question. This led to the development of second phase in model training which is called post-training. The idea of post-training is to own in, sharpen the model to really fit how it's going to be used, which typically means making it a good chat assistant or something like that.

The methods that you use during post-training typically differ. I mean, strictly speaking, you could do post-training in the same way you do pre-training, but with just data that is specialized, maybe just only transcripts of chats and continue doing pre-training on transcripts of chats only and you would de facto be doing a post-training to other chat model. But very often people, like the big success of post-training has been the use of reinforcement learning, so essentially enabling models to learn not from an explicit demonstration of what they should be doing, which is what supervised fine-tuning and what pre-training are, but instead from a feedback about how are they doing.

So the model generates an answer and then from a human, from another model or from many different possibilities, the model gets a feedback of like, this is good, this is bad. And just based on this positive or negative signal, the model learns to improve.

So this is like the experience that a lot of us will have had in ChatGPT where there's like a thumbs up or a thumbs down that you can click after you get a response and that can then be used as a training data for this post-training phase.

Yeah.

And that'd be reinforcement learning from human feedback, RLHF.

Yeah. From a very, very high-level point of view, this is an example of the sort of data you could be leveraging to power this phase of post-training. I think what's really interesting is right now, I'm giving a description where pre-training and post-training are very separate things.

So reality is much less so these days. First, because now pre-training is very dynamic while you shift the data distribution. So you might start with the lower quality data, the more like bulk data.

And as you advance through steps of pre-training, you will focus more on higher quality data, maybe more code, more mathematics, more it could be many more chat data, more of the higher stuff that you consider high quality. I put high quality in quotes because the definition of quality is more of a subject that we could spend hours on. And post-training itself even, now people are starting to do reinforcement learning during the pre-training step or starting at some point, where they start to incorporate mixed plans at you.

It used to be that post-training was a much smaller spend than pre-training. Most of the money used to go to pre-training and to the millions, tens of millions, hundreds of millions of dollars used to go there. But now if you look at recent papers, like Kimi or even Grok 4, not really a paper but more something that they mentioned, which is that they spent nearly as much on post-training as pre-training.

So there's massive scaling up of this post-training phase.

Yeah, exactly. That seems to have allowed Grok 4, for example, to be able to get the highest score yet on humanities last exam, at least at the time of you and me recording this.

Yeah, which might change in a week with another model coming out. It's always moving. But yes, definitely, I think one of the reasons Grok 4 has been so impressive on many of the benchmarks is the larger part of post-training that goes into it, the larger focus on reinforcement learning.

But I would say, obviously, props to the Grok team for being some of the first to put out this sort of artifact. But I think there is a lot more coming. I think that shift has been kind of happening kind of behind the shadows for a while and now is getting fully executed.

And I think most of the modern models are going to be going through much more extensive post-training than pre-training. And part of the reason why is also because post-training data is, if you think about it, I don't want to say more plentiful because it's a very complicated subject, but you can generate new data and new problems that the model is going to solve. When I was mentioning the feedback before, the thumbs up, thumbs down, a big trend that people are probably aware of with DeepSeq, with DeepSeq R1 and was verifiable rewards, where essentially the model solves a mathematics problem or submits an answer to a mathematics problem.

And then that answers get evaluated, and if it's right, that's a positive signal. If it's wrong, that's a negative signal. And obviously, these sort of things are very scalable, you know, mathematics problem, code, like code problems, same thing like tests, you know, for codes, you could use that as a signal.

So it's very easy to imagine, for instance, mining all of the GitHub repositories that are available, pulling all of the tests from them, having the model, you know, write, you know, code that needs to pass this test and using that as a signal at a very large scale. And this is something, you know, that Frontier Labs do. And it is extremely effective.

So there is a plurality of signal that you can use that is massive. And I think now people are very focused on scaling this massive environment in which to run the models to get these signals.

Very cool. And so we've talked about reinforcement learning now in this post-training step. And we've talked about RLHF, where you have human feedback, like the thumbs up, thumbs down.

What other kinds of reinforcement learning approaches are out there?

Yeah, so there is historically the big one, the big first one, the big acronym that got up a lot was RLHF, which is reinforcement learning from human feedback, where you are using your typically annotators, companies like Scale, recently semi-acquired, I guess by Meta, companies like Surge as well, which has been the news a lot. Essentially, having annotators give this thumbs up, thumbs down, or different forms of feedback. Obviously, human data is only so much scalable.

At some point, having armies of people annotating data is not an infinite source or something that really is desirable on getting the model to be more competent. People have started looking for years into ways to get better signals. One of them was what we just mentioned, a verifiable reward.

Some people call this RLVF, or you see a lot in the literature, RLEF, so from execution feedback, because you are executing what the model is producing, testing the result in an environment, looking at that result and being like, okay, based on that, I'm giving a reward or not. By the way, this execution feedback, if you think about it, is if you go back to the roots of reinforcement learning, when people used to do AlphaGo or even before the Atari games. This is essentially execution feedback.

The model plays a game, if it succeeds at the game, then it gets a reward. So it's a much more classical setting, actually, if you think about it in some way. That's the second category, is all of this verifiable reward or execution feedback.

But obviously, not everything is verifiable. Actually, a lot of tasks that we do with the models are not necessarily, strictly speaking, verifiable. If you think...

I think one of the reasons why Atari was such a great place to start was because of how verifiable it was. Point scores that you're trying to optimize, that's a very clear reward function.

A game is very obvious. A game like Go is very obvious at the end. If you win, you lose, or if it's a tie.

But there are many tasks that are not like this. Maybe it could be writing a report, or it could be pretty much a lot of natural language tasks. And this is where I think in terms of scalability and access that has been really, really successful as well is LLIF, where you use AI feedback, so feedback from another model.

And it's kind of this observation, which in insight, I think is very funny because in insight, it's very obvious. Like all of these things, when you look at them in insight, you're like, oh, it's obvious. But when they were getting started, it's like, wow, it's magic that it works at all, which is to use another model to review the output.

So for instance, saying, oh, let's say that you are doing summarization, very basic task, but is a summary that's been generated factual? Does it stick to the fact of the original text? Does it, is it formatted in the right way?

Is it like all of this kind of plurality of things you would want to see out of your summary? And what's really interesting is that this is obviously very scalable because this comes from another model and you can run models infinitely as many times as you want. And so right now, this sort of AI feedback, which some people also bundle up into the idea of synthetic data, of training based on data that is produced by other models, is also seeing a very big growth and very big success because it works so well.

And it's obviously a great way to scale beyond just having the thumbs up, thumbs down from expert annotators to potentially reserving the human for the much more expert stuff, and then having a baseline from other models, other models which might be specialized, and also having the verifiable rewards for our task that can be verified. Big mix of everything.

About a year ago, I did experiments internally at a company that I worked at where we had a very specialized task and it was enormously painful for humans, experts to review that. It took them so long and they just, they expressed real disdain for having to do this task because it was so challenging. And so we thought, well, what if we could use at that time GPT-4 instead of the humans?

And so we needed the humans to do enough that we had a kind of a sample that we could compare, and GPT-4, you know, they were comparable. It was the same quality of results, they were indistinguishable. And so we were like, perfect, this means we can now scale up to as many samples as we want.

Yeah, yeah, totally. And I think this is actually very interesting that you mentioned this species is a comparison with humans, is that a lot of people have pushed back on synthetic, I will say synthetic data as a whole, but on like on data that is model generated because they are like, oh, this is gonna, you know, this is gonna be degenerate data, like this is gonna like fold on, collapse into like something that's bad. And that's possible, you know, you can do this sort of data the wrong way and you can completely mess it up as always.

But in general, it actually works really well. And I think, you know, people have this idea of human data as being very perfect. But actually, if you look at the data that comes out of the typical annotation contract and I won't cite any.

But it's actually not necessarily the quality that you think it is. It takes a lot of review to get it right. Like there is a lot of issues and there are plenty of studies on what people call inter-rater agreement rate, which is like how much if you submit to two different annotators, how much they agree in their rating, you know, maybe if it's a rating on like a like RT scale from 1 to 7, or if it's just a thumbs up, thumbs down.

And the numbers obviously are very task dependent. But when you see them, they are actually crazy. Like actually, it's a lot of noise, there is a massive amount of noise.

And when you measure actually, the same sort of agreement rate with models or between models and humans, you see actually numbers that line up, where essentially the quality that comes out of the model is as good as what comes out of the annotators. Obviously not true of every task, there are tasks, you know, if the judge model is completely incapable, judge model is obviously not gonna be good at this. But there is also another side to this coin, which is that verification is much easier than generation.

So it's much easier, you know, for a model a posteriori to come and to check the results than it is to produce it. And that's something that's very powerful and that probably one of the foundation of why this works so well.

This episode of Super Data Science is brought to you by the Dell AI Factory with NVIDIA, two trusted technology leaders united to deliver a comprehensive and secure AI solution customizable for any business. With a portfolio of products, solutions and services tailored for AI workloads from desktop to data center to cloud, the Dell AI Factory with NVIDIA paves the way for AI to work seamlessly for you. Integrated Dell and NVIDIA capabilities accelerate your AI powered use cases, integrate your data and workflows and enable you to design your own AI journey for repeatable, scalable outcomes.

Visit www.dell.com/superdatascience to learn more. That's dell.com/superdatascience.

Now, this next question is going to get relatively technical, but our technical episodes are some of our most popular ones, so we're going to dig into it a little bit here. Then after that, we'll get back to more applications. We'll talk about your company, we'll talk about adaptive.

But really quickly, I want to get into something really technical here. These different kinds of approaches you talked about, RLHF, where we have the human giving a thumbs up, thumbs down. RLEF, where there's this execution feedback, where there's something kind of innate about what we're evaluating, like an Atari top score that we're trying to reach for.

Or RLAIF, which we talked about most recently, where you're using AI models to kind of give you a thumbs up, thumbs down with an AI system. Regardless of which kind of those approaches we choose, there's also differences in what reinforcement learning algorithm we select, right? So there's things like PPO, A2C, do you want to tell us about the big ones there?

Yeah, yeah, totally. So obviously, RL, you know, HF, IFEF is essentially changing the data on which you are training, but you could also change the method. You know, we keep talking about this RL, but what is, you know, reinforcement learning?

On a very fundamental basis, there is, you know, what makes reinforcement learning so different? There is not really, you know, it's a spectrum, like everything, you know, from SFT to reinforcement learning, you can kind of build step by step, and there's really a spectrum of things. The moment at which it exactly becomes reinforcement learning might be...

SFT, supervised fine-tuning.

Supervised fine-tuning, yes, totally. It's like the moment at which, you know, the transition might be a bit of a question of where everyone puts it, but the very, very general idea, I think the key components to reinforcement learning, and then we can go into how it goes into different methods. I think a big first thing is that reinforcement learning typically, so will be online.

There is a difference in literature between online or offline RL. Like this is actually one of the very big, let's say, theoretical, and I put this in quotes, for as much theory as there can be in machine learning, and well, in especially concerning LLMs, but like historically, you know, people have argued a lot about what is offline and RL, and what does it mean to be offline or online? Well, essentially, online means that you are learning based on the sample you just produced.

So let's say I have a set of weights of my model. I make an inference, you know, I get an answer to the question. I evaluate that answer, like saying, oh, this is good or bad in whatever of the three ways we mentioned before.

And then I use that in the training process to say, okay, so now I update my weights based, you know, on that thumbs up, thumbs down. But I do it with fresh data, with data that has just come off the press. And then, you know, I repeat that process.

I update the weights of the model, and then I get a new sample. Now, what if I accumulate sample, and then I train the model a few times, and then I start collecting samples again? As soon as I'm doing my, you know, I do my first step of training, I'm online.

But as soon as I do the second one, I'm not online anymore, because the data I've generated doesn't come from the same set of weights, it comes from a set of weights that existed before, and that hasn't actually produced the final output. Obviously, this is a bit of a sheep of seizes kind of thing, where, you know, one step might be okay, like might still be more or less the same thing, but two steps, is it really the same model? Three steps, five steps, ten steps.

And then you veer into offline neural. But one of the big, one of the big success, you know, of reinforcement learning is that it is mostly online, but it's mostly like proximally online, where essentially you have samples that are relatively fresh, you evaluate these samples, and you learn from that. And this means something, right now, when I say this, it sounds very abstract.

But actually, there is a very, I think, easy analogy to say to this, is that the samples come from the model, and the model gives, you know, like a suggestion of what it can do, and you tell it if it's good or not. If you think I will make a parallel with human learning, and let's say I'm teaching you a course about general relativity, and I'm teaching you, you know, something about spinning black holes, Kerr matrix, that sort of stuff. I could, if I show you an exercise to do, and I could show you the solution of the exercise, have you memorize it, you know, just memorize it again and again and again, and then, you know, when I present you the exercise, you can run through it exactly the same again.

This is essentially what pre-training or supervised fine-tuning do. Where you are presenting to the model, maybe once, maybe twice, maybe thrice, the same samples, and the model eventually learns from it. Obviously, pre-training still generalizes because pre-training is very diverse.

In pre-training, I don't just show you one problem. I show you, you know, all of the problems that can exist, and there is that expectation. But in post-training, if I just show you, you know, one exercise, and now I tweak something in the exercise, now I say, oh, now actually the black hole is carrying a charge.

Like, and so now you are in a completely different setting, you have no idea what to do. You know, you are going to look at me, you are going to reproduce your answer, it's going to be bad. If we were doing reinforcement learning, the way that it would work is that you would try to do the exercise, and then as a teacher, I would correct it.

And I would tell you, okay, this is good, this is not good, you know, kind of that iterative process. And this is really fundamentally, I think a good mental framework for the difference between, you know, like supervised functioning and reinforcement learning, which is, and that comes to this online-ness, which is that in reinforcement learning, the samples come from the model itself. So it's always in distribution for the model, come within what it's capable to do.

And then slowly, you are shaping that distribution away towards what you want it to be. While in supervised fine-tuning, you are kind of plopping down a new distribution, which might be very out of distribution. And you are hoping that, you know, as you show more and more samples that are diverse in us, you are going to, you know, widen the distribution and hopefully, you know, connect it back to the original knowledge, so that there is no gap in between.

Because if you ask a question that's in between what the model used to know and what you have taught the model, well, there is no guarantee, you know, that you fold that in between it's covered, that's something it has learned. So it's kind of like the difference between the two. And I think this is a very big aspect of reinforcement learning, is that like that online-ness, that learning from trial and error, that part actually touches to the second point, which is something you can somewhat simulate with supervised fine-tuning by filtering the data.

But it's also that reinforcement learning learns from a much wider range of signals. So instead of learning from an explicit, oh, you need to imitate that, it's about, oh, this was good, this was good, this was bad, this was maybe okay-ish, you know, like there's kind of a subtlety to this. You can bring this as well a bit to SFT in some ways, but I think it's a big difference, that learning from a reward, essentially, from positive and negative things.

I love this example that you just gave, talking about teaching me general relativity and how the supervised fine-tuning is kind of like memorizing a solution and the reinforcement learning, this online way of learning, where as I'm producing my output, you're providing me feedback and nudging me in the right direction.

Totally, and I think it's a very good analogy because I actually think it's quite true to what happens. There's a caveat, like, you know, obviously, an adversarial argument to this, and I touch a little bit on it, but I think it's worth double clicking is like, oh, but pre-training works, you know, very clearly pre-training works at teaching the model many things. So why it is, why it's a question of scale is that in pre-training, you know, you are showing not just one exercise, but all exercises that are possible.

In post-training, often, I mean, you can somewhat afford to do this. We discussed this before, post-training is becoming wider and wider. But when you are specializing a model, you know, you want to be as effective as possible, you know, with this to learn as much as possible from every sample that you have, and you might not have the luxury, you know, of every cases that is possible that you have in pre-training.

So, there is kind of like slightly different regime. I put a bit of a star on this because now people run post-training at a much larger scale and it works and well, it has its benefits. So, this is a bit of a caveat here, but the fundamental idea of much more generalization from reinforcement learning because of this online-ness, because of this trial and error and all of that, I think is very fundamental.

And actually, when thinking about reinforcement learning research, I think it's one of the big thing to think about. And to go back to your general question on the different algorithms, so we are a lot like, as you see, is another one, but we are a lot these days, for instance, about PPO, GRPO, GPO, all of this sort of stuff. I think one of them, they are actually quite similar.

The answer is, especially PPO and GRPO, there was a big debate in the community, PPO and GRPO in terms of these components on online-ness and everything share very similar characteristic. What they do differently is more in the question of how then do you attribute, you have a reward, so I tell you, I tell you, you pass the exercise or you fail the exercise, and there's a question of how do you attribute this to individual steps in the exercise or to individual parts of the messages. PPO does this through something that's called like a model that calculates an advantage, so the value model that is going to try to go back from a reward which is sparse, in the level of the tokens, like you have some tokens are rewarded but not others.

Very often, might be just a final token, but sometime it might be a bit more dense. To a reward that is to a value that's at each token, this contributed that much or that. So in PPO, you are training a model to do this, literally you are training a large language model to do this task, which is an interesting view.

In GRPO, it's a bit different. You essentially do an average over multiple rollouts, but fundamentally, this is just a different way to attribute the blame. The fundamentals of the methods are still very, very, very similar and share a lot of similar ideas.

Nice. Very cool. So with that kind of context, that kind of foundation in mind now, including getting into the detail a bit of algorithms like PPO, GRPO, and A2C, let's talk about Adaptive.

So I mentioned right at the top of the episode, something called Adaptive Engine, the flywheel for enterprise AI, which is continuously evaluating, tuning, and serving LLMs uniquely adapted to a business. Tell us more about that.
Yeah. So I think at Adaptive, our motivation has been that reinforcement learning is amazing. All of these methods are really amazing, and this is even more obvious nowadays, I would say, in the past few months, but when we got started a year and a half, two years ago, I think it was still true if you had that experience of going, you were like, oh, these are amazing methods, they can do amazing things, and there's clearly a lot of potential in them.

But there is a bit of a problem, which is that typically these are quite difficult to put in place. It's not, you might remember from reinforcement learning days, AlphaGo or Atari that we mentioned before, and you might also remember that these were very challenging to get right. There was a lot of research around it, very often a lot, if you have studied ML in a bit more formal setting at school, RL often seems a bit opaque.

And also when you have experimented with it, very often depends on the seed, like on the initialization. It's not as bad with LLMs, but with LLMs the difficulty is more on the engineering. Because firstly you are going to be blending inference and training.

Because as we mentioned before, we are teaching the model based on something that it has produced. So we are going to have some time to do rollouts, so to do predictions, and then rate this prediction, and then use that as training. So there is not as much as before, this dichotomy between, oh I serve my LLM to millions of users, and I train my LLM on its cluster.

Now there is a bit more of a combine of the two, which poses an engineering challenge obviously. The other aspect of this is that these are complex pipelines. So typically we mention HF, AIF, VF or EF, depending on how you want to call it.

So this means that during training, the model is going to have to interact, maybe not with humans because maybe this is something that you will put offline and train a reward model, but it will have to interact with other models, maybe two, three, five, 10 of them. Like today we run pipelines which have like five to 10 AI judges in them, and it works perfectly fine, but also environments. So maybe you are going to teach a model to do text to SQL.

If you do this, well, you have to run the queries on the SQL database to get the answer to be able to do execution feedback. Maybe you teach a model to do Rust, and so you need to have a Rust compiler, and maybe you are teaching the model tool use, and so you need access to these tools, or maybe you are teaching the model computer use, in which case you need a VM box, like a virtual machine, in a box where the OS is running and where the model can go through. I do a click on PowerPoint, I open this, so you get all of these things, and now suddenly engineering becomes a nightmare.

One of the reasons pre-training scale so fast is because pre-training is very simple. It's very straightforward. You have this huge batch of tokens, you just predict just the logits, you don't even actually sample, so you just predict the logits, you compare the top one to what was in the text, and that's it.

So it's very, very easy to make it run at impossibly large scale, because fundamentally, yes, there are engineering challenges to distributed computing, obviously, but fundamentally, the algorithm is very simple, very limited in interaction with the external world, and this includes. Whereas with reinforcement learning, now you have all of these environments, all of these other models that you need to interact with. So the motivation at Adaptive is actually to make all of this easy.

We think that reinforcement learning is the way to get the best performance out of a given model for a specific task. We think if you think about it from a Pareto frontier point of view, reinforcement learning will always get you the best cost to performance compromise, always. It's like a new Pareto frontier.

Obviously, this is very attractive for enterprise adopting AI because either they want a cheaper model, same level of performance, but they want something that runs as efficiently as possible, or maybe they want something that's not possible now, and so they want more performance. Reinforcement learning, in both cases, is the answer to get there. But the question is, doing this reinforcement learning.

And so this is what we do at Adaptive. We provide, essentially, data science teams with what we call the RL Ops tooling, kind of for them.

Reinforcement learning ops, RL Ops.

Exactly, so tooling that they need to make this super easy, and so that they don't have to worry about all of this distribution, this interaction, but they can just focus on the logic. So they can just focus on like, oh, I want this judge that does X, Y, Z, maybe there is three, four, five, 10, 15 of them. On top of that, I also want an environment in which something gets checked.

I want this, I want X, put all of this together, some synthetic data generation as well, a lot of lack of these things, and then you don't have to worry about any of the actual implementation or tooling essentially does, I don't want to say compile because that's exactly compilation, but essentially interprets your instruction, your Python recipe, and then runs it on the cluster in a distributed way without you having to think about it. That's fundamentally what we do.

Hey, this is your host, Jon Krohn. I'm excited to announce that I've launched my own AI consultancy, a firm called Y Carrot

At Y Carrot, we combine decades of experience in machine learning and software development with internationally recognized expertise in all the cutting edge approaches, including gen AI, multi-agent systems, and rag. From problem scoping and proof of concept through to high volume production deployments, we can do it all. To learn more, head to ycarot.com.

From there, you can click partner with us to tell us exactly how we can help. Again, that's ycarot.com.

So I guess the target, correct me if I'm wrong, but it sounds like on what you're saying so far, the current adaptive platform is designed for people like software developers, ML engineers who want to have reinforcement learning be easier. So your target audience is probably a lot like my listeners in general, where there are people who are writing, say, Python code.

Yeah, totally, absolutely. And most of our users are data scientists who write Python code to interface with the system. That's totally the target.

If we get into the details of the business, it's always obviously a bit more nuanced than this. We also sometimes work with companies that have much less technical expertise, where they don't have a data science team, they still want to achieve something. So maybe either we will do some of the work, or we have partners like Deloitte that can do some of that work.

So there's always a bit more complexity business-wise, but fundamentally our core idea is to build better training for reinforcement learning so that it's easier to get to value and obviously is something great for data scientists.

Nice. And so if we have a listener today that wants to get started with adaptive, what is that journey like?

Yeah, yeah. So we are still very enterprise focused. I think when we started our company, which is a bit over a year and a half ago now, one of our tithes was to be very focused on enterprise, on larger enterprise because these companies, when they put generic into production, they have a very unique scale, maybe millions, tens, hundreds of millions of users, and that comes with obviously costs that are much larger, so bigger impetus to potentially optimize cost to pack into smaller models.

But although that means that you have much more interactions with the model, and we say more interactions means more data points for post-training. So part of our original thesis was to focus on this sort of company, which means that right now, a lot of our deployments are kind of deploying in our customer infrastructure. We don't really have a cloud available yet, but you can come in with your mom's credit card and just get started.

Well, not your mom's credit card, your company's credit card. But this is something that is coming very soon, where we want to make this more available, like we think also now our tooling is a lot more mature and could be put into more. And so the short answer is that at the moment there is, we don't have an immediate general availability of that.

So if somebody wants to take advantage of being able to do reinforcement learning more easily, they reach out to the sales team from the Adaptive website.

Right now we are very enterprise focused, which means essentially reach out to a human. But we are also excited to change that actually in the future and to make our technology more broadly available, because we think it is at a point where that can be the case and where everyone “should be able to run this sort of stuff, even for OB projects actually. I think there is like, even for this, you know, like try something, maybe it's really good.

Maybe you are able to build, you know, a model that like ends up being much better, much better than what currently exists. And maybe that can be the next big startup that you create, you know, that you get started. It's part of the tooling, you know, for this sort of stuff.

I think one of the reasons we are expanding now to this is, you know, I mentioned something about origin thesis was all you need all of these human data points. Because when we got started, it wasn't as obvious that IEF and synthetic data would work so well. I think it was definitely something we had in our roadmap.

And if you actually go back to our fundraising pitch, we had it like at the end of first year kind of thing. But what has really positively surprised us is how well it works. Like how much you can, like how much leverage does synthetic data give you to go from almost nothing to a “lot.

And this kind of removes, there's still value in having all of these protection data points. Like they have tremendous value, you can do a lot with them. But they are not strictly necessary.

You can get started, you can get bootstrapped from much less. And you can take a very small model, a 8 billion parameter model to be to the frontier performance on a task, mostly entirely with synthetic data, which is quite incredible and very easy to do. So this is why now we are also thinking of why learning availability in a way because, oh, actually, these synthetic data pipelines, anyone can run them, anyone can define them.

You don't need all of these users already to take the benefits of that.

We had the same example that I was giving earlier where we tested the inter-rater reliability, like you mentioned earlier, between the AI model evaluation and the laborious, tedious human evaluation. That was actually for the purpose of what you just said, which was fine tuning an 8 billion parameter model, one that can fit on a single, relatively inexpensive GPU, and get frontier model performance on just a small set of “tasks, yeah, using these kinds of approaches.

Yeah, totally. It works amazingly well. I think the boom in synthetic data, the success of synthetic data, and when I say synthetic data, by the way, it's a very broad word, which means many things, and to me, it means first problem generation sometimes.

So it means like creating new sample, creating new scenarios, maybe new scenarios of conversation, self-play. So maybe simulating a user, like having a model stand in as a user to drive a conversation for self-play, where you have like that, that's first category. But it also mean all of the AIF component of giving feedback, of reviewing some of these things.

It's quite broad, but I think synthetic data has been widely successful. We have a company we worked with, which I can't name, but essentially they are building a chatbot of quite a general use case. And the chatbot, they wanted it to have certain traits, certain psychological traits and that sort of stuff.

And to do this, we are mostly using synthetic data. And we start from something like, I think it's about 70, 80, maybe human annotated samples. And when I say “annotated, in this case, actually, I don't mean thumbs down.

This is something that you find a lot in this reinforcement learning pipeline. We use critics and rewrites, where essentially a human comes in, looks at something that the model has produced, and writes a critic and a new version of it. So literally in natural language.

This is really cool, by the way, because I think when you ask someone, especially someone skilled, like think of a lawyer, think of a psychologist, someone, when you ask them to give thumbs up, thumbs down on thousands of samples, I think it's very, they don't like it. I think they feel a bit like in the meat factory. They feel like their work is being tailorized.

I think they don't like it at all. But when you ask them to give feedback about something or write something, actually, they really enjoy it, which is really funny. They feel more engaged in the process and they feel more in control.

Anyway, we collected something like 70 of these annotations in a bunch of different contexts. From the 70, we are able to generate something like 80,000 synthetic conversations, so through self-play“, about 80,000 synthetic conversations. Each of these conversations is made of about 10 terms, so you are looking at nearly a million messages.

During the reinforcement learning process itself, we explore multiple possibilities. For each of these messages, we might explore five, ten possible answers which gets rewarded by judges. So at the end, you are looking from less than 100 human sample, at something like nearly 10 million data points from which you can learn.

So obviously, a massive multiplying effect from these synthetic data pipelines.

Okay. So that's been a fascinating journey that you've had us on, talking about lots of the reasons why adaptive makes things easier for us, and how we can have more powerful models, have smaller models be able to do things that frontier models might otherwise only be capable of. You've described previously adaptive as a layer on top of foundation models to tailor them to final use cases.

Tell us about this being a layer on top.

Yeah. So the one thing I want to be very clear that we don't do is starting from scratch. Like, I think, you know, a spatialized model in the sense of starting from something from “scratch, I think, you know, there are use cases where it might make sense, but I think for a vast majority, it doesn't, because the reality is that the foundation models, you know, are this amazing engine, this treasure trove, you know, of knowledge and of understanding, which you can sharpen into exactly, you know, what you want.

And I think, you know, for us, what's really important is that why we say we are a layer on top is because we start from open source models. So this might be Lama, Quen, you know, Kimi, you know, whichever one is your favorite flavor and whichever one you are allowed to use at work. We start from them and we tune them to perform better.

But this is only possible because the base model is already amazing, actually. And if the base model is not good, you know, you don't really get anywhere. And this is, you know, back to the example, you know, much earlier we chatted about reinforcement learning used to be even harder, you know, with like initial issue at initialization, with seed and that sort of stuff.

And part of the reason is because this was “reinforcement learning from scratch. And when you are doing reinforcement learning from scratch, the behavior initially is fundamentally unstable because you are asking a random policy, like a random model, to take decisions. But obviously the decisions are random, which is a disaster.

Whereas, you know, when you start with a large language model, you are starting on easy mode because the model is already incredibly smart. Like, one thing to note about pre-training is, you know, we said, oh, the pre-training model is not chatty. And by the way, something I would invite people to do, it's harder these days because as I mentioned, the lines between pre-training and post-training are blurred, but is to look at some of these older pre-trained only model.

I think some of the early LAMA might still be available this way, but you can also look at models like GPT-J, like that were some of the very big, like some of the first, you know, very big success of open source models that were just pre-trained, and you can try to interact with them. Obviously, this model comes from another generation, much less compute spent, but “still you will see it's very different. But anyway, despite that, these models are still amazing.

You'll compare to a random starting point, they are still amazing, they still contain insane knowledge. Like if you think about it, in pre-training, they have seen nearly everything. The knowledge that's contained in this model is insane.

So it's mostly a matter of de-entangling that knowledge to an extent, adding some of it as well. I think there's always a debate, is post-training actually adding knowledge to the model or not at all? I think it does as well in certain conditions.

But essentially of de-entangling the knowledge that's in the model, maybe pruning the part that you don't need as much, surfacing the part that you need the most, and using that as scaffolding to learn even more, to acquire even more capabilities. But this is possible because we start from an amazing open model. That's the sense that we are a layer on top, is that we start from this base open source model and we take them to even better performance.

Nice. Great example there. It makes it crystal clear.

It's interesting how you have all “this background in developing frontier models, pre-training, post-training, and now you've found this niche allowing other people to leverage that kind of background that you already have and be able to accelerate their own use case development, particularly at the RL stage.

Yeah. Totally. Yeah.

I think for us, a lot of what we do now is bringing this expertise in reinforcement learning to be something that anyone can do. Our view is that reinforcement learning, to an extent, is still a bit of a frontier subject. It's still a little bit of something that only a more, maybe more experienced audience gets to experience.

But I think it shouldn't be the case. Like the reality is that these are exceptionally powerful method that should be in the hands of every data scientist, of everyone, much like prompting is in the hands of everyone. I think being able to build these pipelines, to leverage them should be in the hands of everyone to build something really cool.

So ultimately, that's really our goal, is to spread this technology. We see it, one thing that I find personally very, very exciting when we work with customers, that obviously very “often on the first use case, we work very closely with them because we teach our teams how to use the tool, how to think differently as well. Because even teams that have experience with supervised finetuning, having reinforcement learning ask you to think differently.

You don't think so much about the data that's going to be the explicit demonstration, but you think more about measurement of success. So you think more about what defines success, and how do I measure it? So that might be something that's verifiable, that might be with an AI judge, and then you use that to tune the model.

It's a bit of a different way of thing to think. But typically, we start, we work very closely with them on the subject, and then their teams take it on, and we have a customer that can name publicly because they are up here with that, we work a lot with AT&T in the US, and at AT&T, their teams now are using the tool autonomously, and it's always amazing when in the sessions that we hold with them, they come and they're like, AT&T, and you see the scores and “it's really good, and you're like, it's amazing, you too, I think it's really fun for data scientists to be able to have these new capabilities to do more.

Nice that the teams there at AT&T are all grown up now on your training.

They are really good. Actually, and I don't just say this because I can talk about them publicly, I think one of the things that's been really cool in working with AT&T is the maturity in term of bringing Gen.AI to use cases. When you look like whenever we are meeting with them, I'm always surprised by the penetration of Gen.AI inside the organization and everywhere.

In every aspect of the business, they are pushing models to do really amazing things that really create value for the company. I think it's really cool to see that because often, there's always a discussion of, oh, he's AI, you're bubble, he's blah, blah, blah, grumpy people. Sometimes, you might be like, is it like whatever?

I think it's definitely not. I think, yes, some business are slower in adoption. The real world is always slower in adoption.

But there is in companies that are moving forward“, there is insane value being created.

Build the future of multi-agent software with Agency, A-G-N-T-C-Y. The Agency is an open-source collective building the Internet of Agents. It's a collaboration layer where AI agents can discover, connect and work across frameworks.

For developers, this means standardized agent discovery tools, seamless protocols for inter-agent communication, and modular components to compose and scale multi-agent workflows. Join Crew AI, LankChain, Lama Index, Browserbase, Cisco, and dozens more. The Agency is dropping code, specs, and services in no strings attached.

Built with other engineers who care about high-quality multi-agent software, visit agency.org and add your support. That's A-G-N-T-C-Y dot O-R-G. You mentioned there's something that I want to highlight a little bit that these amazing teams at AT&T are doing.

They're getting that definition of the reward function, right? That sounds like it's one of the hardest parts, right? So you're getting people's mindsets on the reinforcement learning cycle, and if you don't define that reward function right, your model isn't going to end up doing in production what you hoped it would.

Yeah, totally. So “I think this is the part where it gets in a different way to think about these problems, that in reinforcement learning, fundamentally what you are thinking about is what defines success? Like how do I define a successful outcome or a bad outcome for the model, and how do I provide the model a signal about this?

And that's really what it becomes all about. There is this quote that I really like for reinforcement, to describe reinforcement learning, which is that, if you can measure it, you can optimize it. And this is literally true, actually.

This sounds very cheesy, but it's actually literally true in the case of reinforcement learning, which is that as soon as you can measure something, you can use it as a reward to optimize it. And because these methods are so powerful, because these models that we are using are so smart, even if the signal is noisy, even if the signal is kind of removed, quite complex, the models are going to find a way, the system is going to find a way to optimize for it, and that's uniquely powerful. So then it becomes entirely a game of how do “I define it?

And this is a part where reinforcement learning becomes more of a, I like to describe it as a pipeline or as a system, because it's not very often, success is multifaceted, there is not just one criteria. So it might be the model needs to behave in this way, it needs to follow these policies, it needs to achieve that X, Y, and then it's about finding the signals, or even in multi-agentic system, finding the signals for individual agents of like, okay, this defines success as this step, I can check it, I can evaluate it, maybe with another model. That's a reward, that's good.

Then I move to the next step and building these things, and also being able to do it end-to-end as well, where ultimately there might be an overall success.

So it's clear that you have a ton of experience, you and the Adaptive team have a ton of experience with getting real-world use cases spun up, particularly leveraging the RL ops that you guys specialize in at Adaptive. I now have a long question. There's a lot of context here, so I hope you have a “big context window, Julien, as well as our listeners.

Because I'm going to dig into a bit about your past prior to what you're doing at Adaptive, but then I'm going to use that to talk about how we can be preparing for the future. You previously worked as an extreme scale team lead at the AI community hugging face, and prior to that at the Gen.AI platform, LightOn. I have another question about LightOn coming up soon.

There's a big question mark around scale these days, where the idea of bigger compute, bigger networks, bigger data driving more model capability. One of those things, more compute, okay, we can just have, you talked about hundreds of thousands of GPUs, you can have a million theoretically. It's an engineering problem.

Same thing with bigger networks, we can have more model weights, or we can have more clever mixture of experts models. But bigger data can be tricky, because you already talked about earlier in this episode, how pre-training can involve all the literature that's ever existed, all of the Internet, so that can theoretically run into short supply. And so different people have different opinions.

Ilya Sutskovor said that “if Gen.AI's fossil fuel is human data on the open Internet, we've exhausted our supply. However, other people like Sam Aldman, Dario Amadei from Asache and Nadella from OpenAI, Anthropic and Microsoft respectively, they don't seem to think it's a problem, that scaling has no end in sight. Synthetic data seems to be part of the solution there.

Yeah, do you think that kind of engineering tricks you've mentioned in past interviews have things like cleaning up data to remove duplicates had a big impact? So do you think that this kind of massaging the data that we have can continue to give us great results going forward, regardless of whether we have more of it?

I think there is a bit of truth in every one of these statements where definitely in terms of readily available data, we are starting to hit a limit, where there was a golden age where we were just starting to do it all, starting to crawl the web and starting to improve your color, and then you add archive paper, and then there was a golden age where data seemed unlimited, and obviously nobody this is less the case. You can massage this “data to improve its quality, to get better results out of what you get. You can order it differently during pre-training, maybe put the lower quality data first so that you get more impact from the later high quality data.

But ultimately, at some point, we have only produced, we have only, as humans, we have only produced so many worlds. So there might be a question of this, of like, do we run out? I think, actually, I can't answer the question, have we run out now, or when?

I think it's quite complex. But I think I can answer the question of what's next, and what's already actually the case, which is we go back to post-training. What's very interesting about post-training is that post-training enables model, and I'm going to use the word of Richard Sutton, because he put it in a very elegant way, it enables model to learn from experience.

So the models actually do something, as we discussed before, get the feedback on that doing, and receive that. And this is infinitely scalable, because this is essentially the experience of the model in the real world. Yes, currently we do “this in simulators, we do this, we formulate these artificial problems.

But it's already possible for models to conduct an experiment in the real world and use that as a reward signal for reinforcement learning. And this, the bits of data we can get from this, I mean, there is no limit. Like it's practically, models can conduct as many trials and many experiments in the real world as resources allow.

So I think this is a part, you know, if you look from a more like very large scaling perspective, like this is where reinforcement learning is very exciting for this, is that actually it's a gateway to a much wider range of signals, a much wider ability to learn. And we are seeing this now, you know, for a while people were seeing reinforcement learning more as like, oh, this only specialization layer or only, you know, like post training layer. But actually, it can be the trend like the bulk of the resources are going to be spent in the future on post training on reinforcement learning, because the models are going to learn from trying again and again across, you know, billions of virtual environments.

And “eventually, although in the real world against trying, you know, their experiments, their own ideas, and this is obviously a very big frontier right now. And people are pushing really hard on it. And it's really, really exciting.

Nice. So that kind of covers the data problem. It sounds like we're good on that front.

Let's talk a little bit about compute as well. And this gets into your experience of Lighton, which I think is interesting. So land use and power requirements of data centers are getting more and more ambitious.

So Mark Zuckerberg recently announced several multi gigawatt clusters, including a five gigawatt data center, which would cover more than three quarters of the area of Manhattan where we're recording today. In a presentation a few years ago in 2021, you said that by this year, by 2025, hardware would become the bottleneck. And so you discussed how things like light-ons, photonic chips, you know, how these kinds of alternative hardware approaches can be the solution.

So maybe neuromorphic chips or photonics. What do you think about this hardware problem?

Yeah. So for context, I used to work when I started when I did my PhD in “France, you can do an industrial PhD when you work with a company, very good system, very surprising that it wasn't invented in the US of all places. But this company, Lighton, now which now mostly does Gene AI, but used to develop a chip which worked with photons instead of electrons, so with light essentially to do computation, to do certain type of computation.

And this comes with a bunch of like advantages, you know, like such on poor consumption, on parallelism, on things you can do. So it's alternative means of computation, sometimes related to neuromorphic, that sort of stuff. And yes, so today the bottleneck is compute.

Definitely, I think this is very obvious, given the money that people are spending towards trying to get more, given the insane valuation of NVIDIA, which is going to continue to increase. So the bottleneck is compute. Obviously, we might ask, do we need, you know, like a new compute padding?

This is actually a subject on which I'm very bearish, personally, on which I have, and maybe this is because I got burnt once. And so I think it's really difficult to bring a new hardware padding to life.
“The current hardware padding has its issues.

It uses a shitload of energy, blah, blah, blah. It's very rigid, but it also has tremendous advantages in that it works really well. Like you can implement this algorithm very effectively.

It works really well. And there is a lot of money that goes into it. If you think about the latest chip from NVIDIA, if you think about the GB200 or the full rack, now it's an entire rack, but if you think even about just the chip, it's probably the most complex object that has ever been built by humankind.

Like when you hold one in your hands, even an H100 or B200, you're probably holding the sum total of all of human achievement. Like all of human achievement has peaked to this thing, which is absolutely insane in terms of engineering to get there. At NVIDIA, it takes a decade to build a generation of ship, from ideation to implementing some of the R&D that is coming out of TSMC, ASML or others, to actually building the compilers for this ship, the first step out and all of this.

So like over a decade of building it, this “isn't even a control of the R&D that goes behind, into extreme UV lightography and all of this. Insane chain of technology. For a competitor to come, for an alternative mean of competing to come, well, you have to reproduce all of that.

And I think this is going to take a while. Like I think the reality is that this is really hard to get at. I think, you know, our current silicon-based paradigm, our current paradigm of computing is really good.

Is there room for improvement, for more specialized hardware, for that sort of stuff? Yes. And, you know, to an extent, the GPUs are already extensively specialized.

They are not really GPUs anymore. You know, they are already extensively specialized to machine learning. And even some people say, oh, I seem to be specialized to transformer.

But this is already happening. You know, if you look into the instruction sets that you have on these GPUs, there are operations that are increasingly becoming specialized to these. They are thinking about, oh, adding some specific unit, for instance, in the attention you have the softmax, which has an exponentiation phase.

So it's our instruction set for “this. Like they are thinking about, oh, can we increase a bit on the chip, the part that is dedicated to this, so that we get a bit more throughput with this. It's better.

So all of this already goes into thinking at NVIDIA. So I think that specialization motion is moving. I will bring another point of view to this, which is something I've been thinking about increasingly recently when chatting with friends of like, oh, what do you think of like, should we change tokenization?

Do we need photonic computing? Do we need quantum computing for that? I think about it in term of like, do we need it to get to AGI slash ASI?

Like, is it something we are gonna discover by yourself that we need to figure out by ourselves to get there? Or is it something that later we are gonna figure out with the support of general intelligent or super intelligent system? Because I think general intelligent system probably already exists.

Like, or is this something that we are gonna figure it out with these systems? And my thinking on the subjects of like, photonic chips or even quantum computing, that we as “humans don't really need to worry about this right now. I think that we already have the capability, like, you know, what we have, the technology that we have are already in us, to take us to the level where we will build system that will help us build this.

I'm sure, you know, in a century, you know, I'm sure we will use photonic chip, I'm sure we will use quantum chips and all of that, but we will have built them with the help of what we are creating currently.

Yeah, so basically, to kind of summarize your big idea there, we can use these chips that were originally designed for graphics processing, and we can leverage those at huge scale to create an AI system. So powerful that it helps us to crack all these other kinds of things.

Exactly, that will help us do scientific research and everything. And a lot of the way that I think about these questions these days is like, what are the innovations that we still need to do to bootstrap the system that will then help us to get even more? And there is stuff left to do.

This is “not a negative point of view. There is nothing left to do. No, there is stuff left to do.

I think we were thinking of reinforcement learning just before. There's plenty of stuff to do in that direction of how do we scale this? How do we enable models to experiment in the real world?

At some point, there is obviously a bottleneck in the real world. If you are a material scientist or a biologist, you conduct experiments in the real world. You don't just sit at your laptop all day.

Models currently cannot do this. There is no way currently for a model to run biology culture in a scalable way. There is no way for a model to run...

There's a tiny bit of prototyping in that space where you have on relatively small scales an AI system that can control a wet lab in the same way.

It's starting with wet labs or even for material science. It's starting, but now people want to scale this because this is one of the next bottlenecks. How do we enable models to run experiments in a scalable way in the real world?

It's super exciting. I find the “first early experiments in this that you mentioned to be really key. I think how do we scale this?

How do we make a wet lab, a material science lab, black or whatever else, something that's addressable to a model that can be easily reset, that can be easily experimented with in a safe way? I think these are really big challenges. So these are subjects that I think, for instance, will need still a lot of innovation and will be key.

So it seems like you spent a lot of time thinking about these powerful AI systems. We might call them artificial general intelligence, if it's kind of at our level or above us, artificial super intelligence and helping us with these kinds of problems, you know, handling material sciences problems, biological problems. And so this is something in my mind, I'd love to hear what you think about this.

In my mind, it's always seemed to me like, like having an AI system, having this AGI kind of system, it isn't, you know, the singularity that that, you know, that we can't really see beyond that that unleashes. Yes, things will be very different, but some things will “still take a lot of time. It's not like instantly overnight cancer is solved because you have to run experiments on probably humans and, you know, tissues and other animals, you know, and that could take decades.

You know, so you can have hunches, the AI might be able to have insights by taking papers from all different kinds of fields and having insights that humans might not have had, but then we still need to run the experiments and those could take a long time.

Yeah, totally. I think, you know, one of the aspects is that I think the superintelligence that we'll create will at first be very spiky. You know, there will be domains where there will be disproportionately superintelligence compared to other.

For instance, I think mathematics is a really good example of this, where we can build like formal verification system, we can build all of this. So like getting to mathematical superintelligence can happen in a box, you know, like literally can happen in a completely closed box. You could build like a superintelligence in mathematics, building a biology superintelligence.

Some people have a different view of this. Some people think, you know, that “like, you know, computer driven biology simulation and everything will be enough. But some others, you know, the state of the science at the moment is that you need experiments.

And so we might build a system that is like beyond genius level at mathematics that can describe mathematics that's way beyond, you know, our ability to understand, but at the same time, if you ask it, you know, to do even the simplest, you know, of like, medicine development might not be that amazing, or the bottleneck might be really good at making up the plan, at updating, you know, you want the plan once you give it the result, and it's going to be like, okay, so now we should try this, blah, blah, blah, but still be bottlenecked by this. So totally, I think it's a very realistic future. I think something that's very clear, I think now, is that the closer we get, like, I think it will definitely happen, you know, like, I think we'll definitely build within probably the next five years, that's my personal bet, but maybe even 10 years for, if you're a bit more bearish, we'll build super intelligent system, but “this super intelligent system will not be super intelligent in everything out of the box.

I think that it should be very messy, actually. I think it will be a very messy time, because in some domains, we will do more progress, probably in the space of like a year, than we have done in the space of all of the existence of our civilization, which will be astonishing, like discovery that we can barely imagine. And in some others, we will barely move.

In some others, it will be like a new flu come around, well, still have to do the work to come up with a vaccine for this year because the system doesn't do that yet. So I think it will be very messy. I think it's one of the nuance that I would bring to the stories that you often read about, like fast takeoff and everything is the messiness of it.

It's very hard to predict which direction is going to work so well, which is not. Maybe some of them, yes, indeed simulation will work very well for some things, and maybe for some things we will be able to do tremendous progress just “in a box without going to experiments. And maybe in some other fields we will desperately need the experiments to be able to make forward progress.

I think it will be very, very unequal, very messy in many ways.

Fascinating. And so it sounds like with me, this super intelligent system that we are careening towards in five to ten years in your view, it is largely a positive thing for humankind.

This is a very complex topic. I'm personally, maybe I'm a more optimistic person. I personally think, yes, it's very positive.

I think, you know, I view scientific progress, I view progress in general as one of the main drivers of what we do. Like, I think it's a view that may be not shared by everyone, but personally, I think it's some of the most beautiful achievement of humankind is progress and understanding of our universe. So I think not only being able to create intelligence, to understand intelligence, to create it, understanding might come after creating it, which is kind of funny, but being able to do this is really beautiful.

I think it's something amazing that we are doing. And I personally think it will “be positive. I think that there will be challenges.

Will it create big societal change that might create unrest? I think yes, that's very likely. But I think on the longer time scale of like, I think the five, ten years where it happens are going to be very messy, for sure.

But I think the time after that is going to be a time of probably the best time ever. I mean, it's always the case. I think the next year is always better than the previous one in human history, more or less.

Give or take a few accidents. But I think overall the trend is always positive because I think all progress gives us more freedom, enables us to do more, to give us more freedom, to have more independence. And so I think that's going to be very positive.

But obviously, this is not to say that there might not be some complexities along the way, that there are problems that we need to solve. Obviously, there's a lot of stuff to figure out.

Articulately said, I couldn't agree more with everything that you said. We're on exactly the same page. You're preaching to the choir“, as it were, at least with me and probably with a lot of our audience as well.

Before I let you go, Julien, this has been a fascinating conversation. I know that you read a lot of sci-fi books. I think your book recommendation might be in that vein, so it kind of gives us...

We've just been talking sci-fi a little bit in real life. Like, real life sci-fi?

In a way, in a way. I actually had a reflection recently when reading sci-fi books, reading depictions of artificial intelligence, that they fall short of the reality of what's happening. I think there are very few books that actually...

where you read them and you are now faced with LLMs, with what we have. I'm like, oh, actually, what we have is better. So, the life surpassed fiction.

Yeah, on the book recommendation thing, it's a book of people that have heard me before will know, will say that I'm obsessed. It's a book I recommend a lot. I've heard a lot of sci-fi and I personally have a fascination with alien contact.

I think one of the most interesting subjects in sci-fi “is the idea of alien contact, of contact with an intelligence that is different than ours. I think based on our previous conversation, you might understand why. I think the idea of different form of intelligence and how we might interface with them is a very fascinating topic.

There's a really good book called Blind Sight from Peter Watts, which is essentially an alien contact story. I won't spoil it, but humans actually in the book are very different. It's in the future.

So humans themselves or intelligence have, and I say intelligences, plural because they have evolved in different ways. But also one of the alien is extraordinarily alien and raise the question of how do you interface with that? How do you interact with that?

I find this to be a very fascinating topic. So yes, it's a fun book that I recommend and I will recommend it again. I think it's an amazing book.

Actually, aliens came up in our research. So as usual, our researcher Serge Macise brought up way more topics than I could possibly cover. But it does help me kind of interview you even the questions that we don't get to.

But you’ve “actually you've talked about aliens before in the context of pre-training, creating something like aliens of extraordinary intelligence, yet little understanding. And then the reinforcement learning, the post-training that comes later allows you to transform those aliens into helpful, grounded assistants.

Yes, this is I think this is an idea that people use to frame under. It's a bit less popular this day, but you know the meme with the Shogoth? The Shogoth or the Shogoth, I don't know how you pronounce it.

I don't know what word you're saying.

It's like, I think it's from Lovecraft. So it's this weird creator.

Oh, Cthulhu?

No, no, no, no, no. It's a specific creator from the Shogoth or Shogoth. I don't remember how it's pronounced.

But anyway, there's this idea, like I think people were comparing for a while models, you know, large language model with it. And there is a few memes on this of like alignment is just putting kind of like just a mask on a terrible creature, on a very frightening and terrible creature. And this kind of comes from that, that immediately after pre-training, the models are very strange.

They know a lot “about us, obviously, because we train them on everything we have ever done. So how could they be so different from us? But they interface with us in a very weird way and some of post-training is about aligning this.

And yeah, that's an idea that comes from here. Yeah, yeah, yeah.

And you had the word exactly right there. It was one I wasn't familiar with. It seems like it's related in the kind of Lovecraft universe, HP Lovecraft universe to Cthulhu in some way, but Shogoth, S-H-O-G-G-O-T-H, I'll have links to images of them in the show notes.

Yeah, plenty of very fun memes in machine learning about them.

Nice, fantastic. Julien, this has been amazing. For people who want to hear more of your brilliant thoughts after this episode, how can they follow you?

Yeah, I mean, it's a very boring corporate way on LinkedIn, Julien Launay, but otherwise on Twitter, I'm at Sleepy Lolo, which I think we can put a link instead of a...

Sleepy Hollow?

Sleepy Lolo, so S-L-I-P-P-Y-L-O-L-O, which is a very long backstory.

Okay, yeah“, we'll have that in the show notes. I'm sure we'll arrange that. Thank you so much, Julien.

It has been a treat to have you here. I learned so much. Thank you.

Thank you very much. I agree.

What an exceptional conversation with the brilliant Julien Launay. In today's episode, Julien covered the evolution from pre-training, that's predicting next tokens on web scale data, to post-training, that's reinforcement learning, as the dominant phase of LLM development. He talked about how AdaptiveML's platform makes reinforcement learning accessible to data scientists, enabling companies like AT&T to autonomously tune smaller models to frontier performance.

He went in detail on the three types of reinforcement learning feedback, that's RLHF, from human feedback, like human thumbs up, thumbs down, RLAIF, where AI models evaluate performance, and RLEF, where we have verifiable rewards from code execution or game scores. Julien gave his prediction that will achieve super intelligence within 5-10 years, but that it will be messy and spiky, revolutionary in domains like mathematics, while still requiring real-world experiments for things like biology and medicine. And he talked about why current silicon-based computing is likely sufficient to bootstrap AGI, which “will then help us to scale new computing paradigms like photonic and quantum computing technologies.

